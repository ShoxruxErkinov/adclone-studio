import {mkdirSync,copyFileSync,writeFileSync,readdirSync} from 'node:fs';
mkdirSync('public/fonts',{recursive:true});
const dir='node_modules/@fontsource/manrope/files';
for(const subset of ['latin','cyrillic']){const file=readdirSync(dir).find(n=>n===`manrope-${subset}-800-normal.woff2`);if(file)copyFileSync(`${dir}/${file}`,`public/fonts/manrope-${subset}.woff2`);}
// Original synthesized 8-second instrumental loop; no third-party music rights required.
const sr=22050,n=sr*8,pcm=Buffer.alloc(n*2);const frequencies=[220,261.6256,329.6276,392];
for(let i=0;i<n;i++){const t=i/sr;const beat=t%.5;const chord=frequencies.reduce((sum,f)=>sum+Math.sin(2*Math.PI*f*t)*.022,0);const kick=Math.sin(2*Math.PI*(55+65*Math.exp(-beat*30))*beat)*Math.exp(-beat*22)*.22;const pluck=Math.sin(2*Math.PI*frequencies[Math.floor(t*2)%4]*2*t)*Math.exp(-beat*10)*.075;const edge=Math.min(1,t*50,(8-t)*50);pcm.writeInt16LE(Math.round(Math.max(-1,Math.min(1,(chord+kick+pluck)*edge))*32767),i*2);}
const header=Buffer.alloc(44);header.write('RIFF');header.writeUInt32LE(36+pcm.length,4);header.write('WAVE',8);header.write('fmt ',12);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(sr,24);header.writeUInt32LE(sr*2,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);writeFileSync('public/studio-beat.wav',Buffer.concat([header,pcm]));
