import { getDatabase } from '../client/sqlite';
import { Transaction } from '../../types';
import * as Crypto from 'expo-crypto';

export class TransactionRepository {
    async getAll(): Promise<Transaction[]> {
        const db = await getDatabase();
        return db.getAllAsync<Transaction>('SELECT * FROM transactions ORDER BY happened_at DESC');
    }

    async create(tx: Partial<Transaction>): Promise<string> {
        const db = await getDatabase();
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();

        await db.runAsync(
            'INSERT INTO transactions (id, type, account_id, to_account_id, category_id, amount_cents, happened_at, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            id, tx.type, tx.account_id, tx.to_account_id ?? null, tx.category_id ?? null, tx.amount_cents ?? 0, tx.happened_at || now, tx.note ?? null, now, now
        );

        return id;
    }

    async getRecent(limit = 10): Promise<Transaction[]> {
        const db = await getDatabase();
        return db.getAllAsync<Transaction>('SELECT * FROM transactions ORDER BY happened_at DESC LIMIT ?', limit);
    }
}

export const transactionRepository = new TransactionRepository();
