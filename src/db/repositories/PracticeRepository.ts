import { getDatabase } from '../client/sqlite';
import { PracticeDefinition, PracticeCheckin } from '../../types';
import * as Crypto from 'expo-crypto';

export class PracticeRepository {
    async getDefinitions(): Promise<PracticeDefinition[]> {
        const db = await getDatabase();
        return db.getAllAsync<PracticeDefinition>('SELECT * FROM practice_definitions ORDER BY created_at ASC');
    }

    async getDefinitionByCode(code: string): Promise<PracticeDefinition | null> {
        const db = await getDatabase();
        return db.getFirstAsync<PracticeDefinition>('SELECT * FROM practice_definitions WHERE code = ?', code);
    }

    async createDefinition(definition: Partial<PracticeDefinition>): Promise<string> {
        const db = await getDatabase();
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();

        await db.runAsync(
            'INSERT INTO practice_definitions (id, code, title, scope, is_system, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            id,
            definition.code ?? '',
            definition.title ?? '',
            definition.scope || 'daily',
            definition.is_system ? 1 : 0,
            now
        );

        return id;
    }

    async getCheckin(definitionId: string, date: string, cycleId?: string): Promise<PracticeCheckin | null> {
        const db = await getDatabase();
        if (cycleId) {
            return db.getFirstAsync<PracticeCheckin>(
                'SELECT * FROM practice_checkins WHERE practice_definition_id = ? AND checkin_date = ? AND cycle_id = ?',
                definitionId,
                date,
                cycleId
            );
        }
        return db.getFirstAsync<PracticeCheckin>(
            'SELECT * FROM practice_checkins WHERE practice_definition_id = ? AND checkin_date = ? AND cycle_id IS NULL',
            definitionId,
            date
        );
    }

    async upsertCheckin(checkin: Partial<PracticeCheckin> & { practice_definition_id: string, checkin_date: string, status: 'missed' | 'minimum' | 'optimum' | 'maximum' }): Promise<void> {
        const db = await getDatabase();
        const existing = await this.getCheckin(checkin.practice_definition_id, checkin.checkin_date, checkin.cycle_id);

        if (existing) {
            await db.runAsync(
                'UPDATE practice_checkins SET status = ?, note = ? WHERE id = ?',
                checkin.status,
                checkin.note ?? null,
                existing.id
            );
        } else {
            const id = Crypto.randomUUID();
            const now = new Date().toISOString();
            await db.runAsync(
                'INSERT INTO practice_checkins (id, cycle_id, practice_definition_id, checkin_date, status, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                id,
                checkin.cycle_id ?? null,
                checkin.practice_definition_id,
                checkin.checkin_date,
                checkin.status,
                checkin.note ?? null,
                now
            );
        }
    }

    async getCheckinsForPeriod(startDate: string, endDate: string, cycleId?: string): Promise<PracticeCheckin[]> {
        const db = await getDatabase();
        if (cycleId) {
            return db.getAllAsync<PracticeCheckin>(
                'SELECT * FROM practice_checkins WHERE checkin_date >= ? AND checkin_date <= ? AND cycle_id = ? ORDER BY checkin_date DESC',
                startDate,
                endDate,
                cycleId
            );
        }
        return db.getAllAsync<PracticeCheckin>(
            'SELECT * FROM practice_checkins WHERE checkin_date >= ? AND checkin_date <= ? AND cycle_id IS NULL ORDER BY checkin_date DESC',
            startDate,
            endDate
        );
    }
}

export const practiceRepository = new PracticeRepository();
