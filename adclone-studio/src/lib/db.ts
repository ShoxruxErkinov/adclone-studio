import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import type { Project, ProjectInput, RenderJob } from './model';

export const dataDir = path.resolve(/* turbopackIgnore: true */ process.env.ADCLONE_DATA_DIR || '.data');
mkdirSync(path.join(dataDir, 'assets'), { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'studio.sqlite'));
db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS projects(id TEXT PRIMARY KEY, body TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS wallet(id INTEGER PRIMARY KEY CHECK(id=1), balance INTEGER NOT NULL CHECK(balance>=0));
INSERT OR IGNORE INTO wallet VALUES(1,10);
CREATE TABLE IF NOT EXISTS renders(id TEXT PRIMARY KEY, project_id TEXT NOT NULL, project_name TEXT NOT NULL, snapshot TEXT NOT NULL, fingerprint TEXT NOT NULL, status TEXT NOT NULL, progress REAL NOT NULL DEFAULT 0, error TEXT, asset TEXT, created_at TEXT NOT NULL);
CREATE UNIQUE INDEX IF NOT EXISTS active_render ON renders(fingerprint) WHERE status IN ('queued','rendering');
CREATE TABLE IF NOT EXISTS ledger(id TEXT PRIMARY KEY, render_id TEXT NOT NULL, amount INTEGER NOT NULL, kind TEXT NOT NULL, created_at TEXT NOT NULL, UNIQUE(render_id,kind));
CREATE TABLE IF NOT EXISTS heartbeat(id INTEGER PRIMARY KEY CHECK(id=1), timestamp INTEGER NOT NULL);
`);
const transaction = <T>(fn: () => T): T => { db.exec('BEGIN IMMEDIATE'); try { const result = fn(); db.exec('COMMIT'); return result; } catch(e) { db.exec('ROLLBACK'); throw e; } };
export function listProjects(): Project[] { return (db.prepare('SELECT body FROM projects ORDER BY updated_at DESC').all() as {body: string}[]).map(x => JSON.parse(x.body)); }
export function getProject(id: string): Project | null { const row = db.prepare('SELECT body FROM projects WHERE id=?').get(id) as {body: string} | undefined; return row ? JSON.parse(row.body) : null; }
export function saveProject(input: ProjectInput, id?: string): Project {
  const previous = id ? getProject(id) : null;
  if (id && !previous) throw new Error('Loyiha topilmadi.');
  const now = new Date().toISOString();
  const project: Project = { ...input, id: id || randomUUID(), createdAt: previous?.createdAt || now, updatedAt: now };
  db.prepare('INSERT INTO projects VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body,updated_at=excluded.updated_at').run(project.id, JSON.stringify(project), now);
  return project;
}
export function deleteProject(id: string) { db.prepare('DELETE FROM projects WHERE id=?').run(id); }
export function credits(): number { return (db.prepare('SELECT balance FROM wallet WHERE id=1').get() as { balance: number }).balance; }
function mapRender(row: Record<string, unknown>): RenderJob { return { id: String(row.id), projectId: String(row.project_id), projectName: String(row.project_name), status: row.status as RenderJob['status'], progress: Number(row.progress), error: row.error as string | null, asset: row.asset as string | null, createdAt: String(row.created_at) }; }
export function listRenders(): RenderJob[] { return db.prepare('SELECT * FROM renders ORDER BY created_at DESC LIMIT 50').all().map(mapRender); }
export function enqueue(project: Project): RenderJob {
  const { id: projectId, createdAt: _created, updatedAt: _updated, ...snapshot } = project;
  const fingerprint = createHash('sha256').update(projectId + JSON.stringify(snapshot)).digest('hex');
  return transaction(() => {
    const existing = db.prepare("SELECT * FROM renders WHERE fingerprint=? AND status IN ('queued','rendering')").get(fingerprint);
    if (existing) return mapRender(existing);
    if (credits() < 1) throw new Error('Test kreditlari tugadi. Mahalliy bazani boshqarish uchun README yo‘riqnomasini ko‘ring.');
    const id = randomUUID(); const now = new Date().toISOString();
    db.prepare("INSERT INTO renders(id,project_id,project_name,snapshot,fingerprint,status,created_at) VALUES(?,?,?,?,?,'queued',?)").run(id, projectId, project.name, JSON.stringify(snapshot), fingerprint, now);
    db.prepare('UPDATE wallet SET balance=balance-1 WHERE id=1').run();
    db.prepare('INSERT INTO ledger VALUES(?,?,?,?,?)').run(randomUUID(), id, -1, 'reserve', now);
    return mapRender(db.prepare('SELECT * FROM renders WHERE id=?').get(id)!);
  });
}
export function claimJob(): { id: string; snapshot: ProjectInput } | null {
  return transaction(() => { const row = db.prepare("SELECT id,snapshot FROM renders WHERE status='queued' ORDER BY created_at LIMIT 1").get() as {id: string; snapshot: string} | undefined;
    if (!row) return null;
    db.prepare("UPDATE renders SET status='rendering' WHERE id=?").run(row.id);
    return { id: row.id, snapshot: JSON.parse(row.snapshot) };
  });
}
export function progress(id: string, value: number) { db.prepare("UPDATE renders SET progress=? WHERE id=? AND status='rendering'").run(Math.min(99, Math.max(0, value)), id); }
export function complete(id: string, asset: string) { db.prepare("UPDATE renders SET status='completed',progress=100,asset=? WHERE id=? AND status='rendering'").run(asset, id); }
export function fail(id: string, message: string) {
  transaction(() => {
    const row = db.prepare('SELECT status FROM renders WHERE id=?').get(id);
    if (!row || row.status === 'completed' || row.status === 'failed') return;
    db.prepare("UPDATE renders SET status='failed',error=? WHERE id=?").run(message.slice(0, 500), id);
    const change = db.prepare('INSERT OR IGNORE INTO ledger VALUES(?,?,?,?,?)').run(randomUUID(), id, 1, 'refund', new Date().toISOString());
    if (change.changes) db.prepare('UPDATE wallet SET balance=balance+1 WHERE id=1').run();
  });
}
export function recoverInterrupted() { for (const row of db.prepare("SELECT id FROM renders WHERE status='rendering'").all()) fail(String(row.id), 'Render worker qayta ishga tushdi. Kredit qaytarildi; qayta eksport qiling.'); }
export function heartbeat() { db.prepare('INSERT INTO heartbeat VALUES(1,?) ON CONFLICT(id) DO UPDATE SET timestamp=excluded.timestamp').run(Date.now()); }
export function workerAlive(): boolean { const row = db.prepare('SELECT timestamp FROM heartbeat WHERE id=1').get(); return !!row && Date.now() - Number(row.timestamp) < 20000; }
