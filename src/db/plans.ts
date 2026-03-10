import { getDb, saveDb } from './init';

export type PlanStatus = 'not_started' | 'in_progress' | 'done';

export interface Plan {
  id: string;
  title: string;
  description: string;
  status: PlanStatus;
  createdAt: string;
  targetDate: string | null;
  sortOrder: number;
}

function rowToPlan(row: unknown[]): Plan {
  return {
    id: row[0] as string,
    title: row[1] as string,
    description: row[2] as string,
    status: (row[3] as string) as PlanStatus,
    createdAt: row[4] as string,
    targetDate: (row[5] as string) || null,
    sortOrder: (row[6] as number) ?? 0,
  };
}

export function getPlans(): Plan[] {
  const db = getDb();
  if (!db) return [];
  const result = db.exec('SELECT id, title, description, status, createdAt, targetDate, sortOrder FROM plans ORDER BY sortOrder ASC, createdAt ASC');
  if (!result.length || !result[0].values.length) return [];
  return result[0].values.map(rowToPlan);
}

export function getPlan(id: string): Plan | null {
  const db = getDb();
  if (!db) return null;
  const stmt = db.prepare('SELECT id, title, description, status, createdAt, targetDate, sortOrder FROM plans WHERE id = ?') as { bind: (p: unknown[]) => void; step: () => boolean; get: () => unknown[]; free: () => void };
  stmt.bind([id]);
  const row = stmt.step() ? stmt.get() : null;
  stmt.free();
  return row ? rowToPlan(row) : null;
}

export async function addPlan(plan: Omit<Plan, 'id' | 'createdAt'>): Promise<Plan> {
  const db = getDb();
  if (!db) throw new Error('DB not initialized');
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const stmt = db.prepare('INSERT INTO plans (id, title, description, status, createdAt, targetDate, sortOrder) VALUES (?, ?, ?, ?, ?, ?, ?)') as { bind: (p: unknown[]) => void; step: () => boolean; free: () => void };
  stmt.bind([id, plan.title, plan.description ?? '', plan.status, createdAt, plan.targetDate ?? null, plan.sortOrder ?? 0]);
  stmt.step();
  stmt.free();
  await saveDb();
  return { ...plan, id, createdAt, targetDate: plan.targetDate ?? null, sortOrder: plan.sortOrder ?? 0 };
}

export async function updatePlan(id: string, updates: Partial<Pick<Plan, 'title' | 'description' | 'status' | 'targetDate' | 'sortOrder'>>): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('DB not initialized');
  const current = getPlan(id);
  if (!current) return;
  const stmt = db.prepare('UPDATE plans SET title = ?, description = ?, status = ?, targetDate = ?, sortOrder = ? WHERE id = ?') as { bind: (p: unknown[]) => void; step: () => boolean; free: () => void };
  stmt.bind([
    updates.title ?? current.title,
    updates.description ?? current.description,
    updates.status ?? current.status,
    updates.targetDate ?? current.targetDate,
    updates.sortOrder ?? current.sortOrder,
    id,
  ]);
  stmt.step();
  stmt.free();
  await saveDb();
}

export async function deletePlan(id: string): Promise<void> {
  const db = getDb();
  if (!db) throw new Error('DB not initialized');
  const stmt = db.prepare('DELETE FROM plans WHERE id = ?') as { bind: (p: unknown[]) => void; step: () => boolean; free: () => void };
  stmt.bind([id]);
  stmt.step();
  stmt.free();
  await saveDb();
}
