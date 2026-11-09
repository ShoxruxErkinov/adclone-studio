import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {alignmentToWords,createDraft,estimatedWords,languages,projectInputSchema,scriptText,templateScenes,videoDuration} from '../src/lib/model';
import {publicIPv4,validateRemoteUrl,detectImage} from '../src/lib/network';
import {parseProductHtml} from '../src/lib/providers';
import {guardLocal} from '../src/lib/http';

test('rejects SSRF destinations, credentials and non-HTTPS input',()=>{
  for(const url of ['http://shop.example/product','https://127.0.0.1/a','https://[::1]/','https://x.local/a','https://user:password@amazon.com/p','https://amazon.com:8080/p','file:///etc/passwd'])assert.throws(()=>validateRemoteUrl(url));
  assert.equal(validateRemoteUrl('https://uzum.uz/uz/product/test').hostname,'uzum.uz');
  for(const ip of ['127.0.0.1','10.0.0.1','172.16.0.1','192.168.1.1','169.254.169.254','100.64.0.2','0.0.0.0','198.18.0.1','224.0.0.1','::1'])assert.equal(publicIPv4(ip),false,ip);
  assert.equal(publicIPv4('8.8.8.8'),true);
});
test('local demo blocks foreign origins and public hosts',()=>{
  assert.throws(()=>guardLocal(new Request('http://127.0.0.1:3000/api/studio',{headers:{host:'127.0.0.1:3000',origin:'https://evil.example'}})));
  assert.throws(()=>guardLocal(new Request('https://ad.example/api/studio',{headers:{host:'ad.example'}})));
  assert.doesNotThrow(()=>guardLocal(new Request('http://127.0.0.1:3000/api/studio',{headers:{host:'127.0.0.1:3000',origin:'http://127.0.0.1:3000'}})));
});
test('parses nested JSON-LD and OpenGraph without inventing missing metadata',()=>{
  const product=parseProductHtml(`<script type="application/ld+json">{"@graph":[{"@type":"Product","name":"Test headset","description":"<b>Wireless</b>","image":["/image.png"],"offers":{"price":"49","priceCurrency":"USD"}}]}</script>`,'https://shop.example/item');
  assert.equal(product.title,'Test headset');assert.equal(product.description,'Wireless');assert.equal(product.price,'49 USD');assert.equal(product.image,'https://shop.example/image.png');
  const og=parseProductHtml('<meta property="og:title" content="Coffee"><meta property="og:image" content="https://images.example/p.jpg">','https://shop.example/coffee');assert.equal(og.price,'');assert.equal(og.title,'Coffee');
  assert.throws(()=>parseProductHtml('<html>Access denied</html>','https://shop.example/'));
});
test('image uploads reject HTML disguised with an image extension',()=>{assert.throws(()=>detectImage(Buffer.from('<svg onload="alert(1)">')));assert.equal(detectImage(Buffer.from([255,216,255,0])),'jpg');});
test('all five templates have a valid storyboard and monotonic timing',()=>{
  for(const language of Object.keys(languages) as (keyof typeof languages)[]){const project=createDraft(undefined,language);assert.equal(projectInputSchema.safeParse(project).success,true);const words=estimatedWords(project);assert.ok(words.length>10);for(let i=0;i<words.length;i++){assert.ok(words[i].end>=words[i].start);if(i)assert.ok(words[i].start>=words[i-1].end-1e-8);}assert.equal(words.at(-1)?.end,15);assert.deepEqual(templateScenes(project.product,language).map(s=>s.role),['hook','problem','solution','cta']);}
});
test('ElevenLabs character alignment becomes word alignment and preserves last word',()=>{
  const words=alignmentToWords({characters:['S','a','l','o','m',' ','d','u','n','y','o'],character_start_times_seconds:[0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1],character_end_times_seconds:[.1,.2,.3,.4,.5,.6,.7,.8,.9,1,1.1]});
  assert.deepEqual(words,[{word:'Salom',start:0,end:.5},{word:'dunyo',start:.6,end:1.1}]);
  const p=createDraft();p.voice={url:'/api/assets/00000000-0000-0000-0000-000000000001.mp3',text:scriptText(p),words,duration:18.8,provider:'elevenlabs'};assert.equal(videoDuration(p),20);
});
test('credit reservation is idempotent, failures refund once, interrupted work recovers',async()=>{
  process.env.ADCLONE_DATA_DIR=mkdtempSync(path.join(tmpdir(),'adclone-test-'));
  const db=await import('../src/lib/db');
  const p=db.saveProject(createDraft());const initial=db.credits();
  const a=db.enqueue(p),b=db.enqueue(p);assert.equal(a.id,b.id);assert.equal(db.credits(),initial-1);
  const job=db.claimJob();assert.equal(job?.id,a.id);db.fail(a.id,'Test failure');db.fail(a.id,'Duplicate failure');assert.equal(db.credits(),initial);
  const retry=db.enqueue(p);assert.notEqual(retry.id,a.id);db.claimJob();db.recoverInterrupted();assert.equal(db.credits(),initial);
  const done=db.enqueue(p);db.claimJob();db.complete(done.id,'test.mp4');db.fail(done.id,'Late failure');assert.equal(db.credits(),initial-1);
});
