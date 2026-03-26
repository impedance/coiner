import { getDatabase } from '../client/sqlite';
import { Artifact } from '../../types';
import * as Crypto from 'expo-crypto';

export class ArtifactRepository {
    async getAll(): Promise<Artifact[]> {
        const db = await getDatabase();
        return db.getAllAsync<Artifact>('SELECT * FROM artifacts ORDER BY created_at DESC');
    }

    async getByGoalId(goalId: string): Promise<Artifact[]> {
        const db = await getDatabase();
        return db.getAllAsync<Artifact>('SELECT * FROM artifacts WHERE goal_id = ? ORDER BY created_at DESC', goalId);
    }

    async getById(id: string): Promise<Artifact | null> {
        const db = await getDatabase();
        return db.getFirstAsync<Artifact>('SELECT * FROM artifacts WHERE id = ?', id);
    }

    async create(artifact: Partial<Artifact>): Promise<string> {
        const db = await getDatabase();
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();

        await db.runAsync(
            'INSERT INTO artifacts (id, goal_id, title, description, image_uri, unlock_rule_type, unlock_amount_cents, unlocked_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            id,
            artifact.goal_id ?? null,
            artifact.title ?? '',
            artifact.description ?? null,
            artifact.image_uri ?? null,
            artifact.unlock_rule_type ?? 'manual',
            artifact.unlock_amount_cents ?? null,
            artifact.unlocked_at ?? null,
            now,
            now
        );

        return id;
    }

    async update(id: string, artifact: Partial<Artifact>): Promise<void> {
        const db = await getDatabase();
        const now = new Date().toISOString();

        const sets: string[] = [];
        const params: any[] = [];

        if (artifact.title !== undefined) { sets.push('title = ?'); params.push(artifact.title); }
        if (artifact.description !== undefined) { sets.push('description = ?'); params.push(artifact.description); }
        if (artifact.image_uri !== undefined) { sets.push('image_uri = ?'); params.push(artifact.image_uri); }
        if (artifact.unlock_rule_type !== undefined) { sets.push('unlock_rule_type = ?'); params.push(artifact.unlock_rule_type); }
        if (artifact.unlock_amount_cents !== undefined) { sets.push('unlock_amount_cents = ?'); params.push(artifact.unlock_amount_cents); }
        if (artifact.unlocked_at !== undefined) { sets.push('unlocked_at = ?'); params.push(artifact.unlocked_at); }

        if (sets.length === 0) return;

        sets.push('updated_at = ?');
        params.push(now);
        params.push(id);

        await db.runAsync(`UPDATE artifacts SET ${sets.join(', ')} WHERE id = ?`, ...params);
    }

    async delete(id: string): Promise<void> {
        const db = await getDatabase();
        await db.runAsync('DELETE FROM artifacts WHERE id = ?', id);
    }
}

export const artifactRepository = new ArtifactRepository();
