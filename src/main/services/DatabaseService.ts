import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import { Quote } from '@/shared/types/market.types';

class DatabaseService {
    private db: Database.Database;

    constructor(dbPath: string) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        this.db = new Database(dbPath, { verbose: console.log });
        this.init();
    }

    private init(): void {
        const createQuotesTable = `
            CREATE TABLE IF NOT EXISTS quotes (
                symbol TEXT PRIMARY KEY,
                name TEXT,
                price REAL,
                change REAL,
                changePercent REAL,
                market TEXT,
                lastUpdate INTEGER
            );
        `;
        this.db.exec(createQuotesTable);
    }

    public getQuote(symbol: string): Quote | null {
        const stmt = this.db.prepare('SELECT * FROM quotes WHERE symbol = ?');
        const row = stmt.get(symbol);
        return row as Quote | null;
    }

    public getAllQuotes(): Quote[] {
        const stmt = this.db.prepare('SELECT * FROM quotes');
        const rows = stmt.all();
        return rows as Quote[];
    }

    public saveQuote(quote: Quote): void {
        const stmt = this.db.prepare(`
            INSERT INTO quotes (symbol, name, price, change, changePercent, market, lastUpdate)
            VALUES (@symbol, @name, @price, @change, @changePercent, @market, @lastUpdate)
            ON CONFLICT(symbol) DO UPDATE SET
                name = excluded.name,
                price = excluded.price,
                change = excluded.change,
                changePercent = excluded.changePercent,
                market = excluded.market,
                lastUpdate = excluded.lastUpdate;
        `);
        stmt.run(quote);
    }

    public close(): void {
        this.db.close();
    }
}

export default DatabaseService; 