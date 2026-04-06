import { getDatabase } from '../client/sqlite';

export class BackupRepository {
    private tables = [
        'accounts', 'category_groups', 'categories', 'transactions', 'monthly_bucket_plans', 
        'goals', 'goal_contributions', 'weekly_reviews', 'artifacts', 
        'practice_definitions', 'cycles', 'cycle_practices', 
        'practice_checkins', 'app_settings', 'money_steps'
    ];

    async exportAll(): Promise<Record<string, any[]>> {
        const db = await getDatabase();
        const data: Record<string, any[]> = {};

        for (const table of this.tables) {
            try {
                data[table] = await db.getAllAsync(`SELECT * FROM ${table}`);
            } catch (e) {
                console.warn(`Export failed for table ${table}:`, e);
                data[table] = [];
            }
        }

        return data;
    }

    async importAll(data: Record<string, any[]>): Promise<void> {
        const db = await getDatabase();

        await db.withTransactionAsync(async () => {
            // Clear existing data (be careful with order for foreign keys)
            // For MVP, we'll just delete in reverse order of dependencies or disable keys
            await db.execAsync('PRAGMA foreign_keys = OFF');
            
            for (const table of this.tables) {
                await db.runAsync(`DELETE FROM ${table}`);
            }

            for (const table in data) {
                if (!this.tables.includes(table)) continue;
                const rows = data[table];
                if (rows.length === 0) continue;

                const columns = Object.keys(rows[0]);
                const placeholders = columns.map(() => '?').join(', ');
                const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

                for (const row of rows) {
                    const values = columns.map(col => row[col]);
                    await db.runAsync(sql, ...values);
                }
            }

            await db.execAsync('PRAGMA foreign_keys = ON');
        });
    }

    async clearAllData(): Promise<void> {
        const db = await getDatabase();
        await db.withTransactionAsync(async () => {
            await db.execAsync('PRAGMA foreign_keys = OFF');
            for (const table of this.tables) {
                await db.runAsync(`DELETE FROM ${table}`);
            }
            await db.execAsync('PRAGMA foreign_keys = ON');
        });
    }

    async exportTransactionsCSV(): Promise<string> {
        const db = await getDatabase();
        const transactions = await db.getAllAsync<any>(`
            SELECT t.happened_at, t.type, t.amount_cents, a.name as account_name, c.name as category_name, t.note
            FROM transactions t
            LEFT JOIN accounts a ON t.account_id = a.id
            LEFT JOIN categories c ON t.category_id = c.id
            ORDER BY t.happened_at DESC
        `);

        const header = ['Date', 'Type', 'Amount', 'Account', 'Category', 'Note'];
        const csvRows = [header.join(',')];

        for (const t of transactions) {
            const row = [
                t.happened_at,
                t.type,
                (t.amount_cents / 100).toFixed(2),
                `"${t.account_name || ''}"`,
                `"${t.category_name || ''}"`,
                `"${(t.note || '').replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        }

        return csvRows.join('\n');
    }
}

export const backupRepository = new BackupRepository();
