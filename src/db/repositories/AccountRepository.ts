import { getDatabase } from '../client/sqlite';
import { Account } from '../../types';
import * as Crypto from 'expo-crypto';

export class AccountRepository {
    async getAll(): Promise<Account[]> {
        const db = await getDatabase();
        return db.getAllAsync<Account>('SELECT * FROM accounts WHERE is_archived = 0');
    }

    async create(account: Partial<Account>): Promise<string> {
        const db = await getDatabase();
        const id = Crypto.randomUUID();
        const now = new Date().toISOString();

        await db.runAsync(
            'INSERT INTO accounts (id, name, type, currency, opening_balance_cents, is_archived, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            id, account.name, account.type, account.currency, account.opening_balance_cents ?? 0, 0, now, now
        );

        return id;
    }
}

export const accountRepository = new AccountRepository();
