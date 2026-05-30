import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// If DB_SCHEMA is set (e.g. "family"), route all queries to that schema
// by appending search_path to the connection string options.
function buildConnectionString(): string {
  const base = process.env.DATABASE_URL || '';
  const schema = process.env.DB_SCHEMA;
  if (!schema || schema === 'public') return base;
  const sep = base.includes('?') ? '&' : '?';
  return `${base}${sep}options=${encodeURIComponent(`-c search_path=${schema},public`)}`;
}

const pool = new Pool({
  connectionString: buildConnectionString(),
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

export { pool };

export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T | undefined> {
  const rows = await query<T>(sql, params);
  return rows[0];
}

export async function execute(sql: string, params?: unknown[]): Promise<void> {
  await pool.query(sql, params);
}

export async function initDb(): Promise<void> {
  const schema = process.env.DB_SCHEMA;

  // Use a dedicated client so SET search_path persists for all DDL below
  const client = await pool.connect();
  try {
    if (schema && schema !== 'public') {
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
      await client.query(`SET search_path TO "${schema}", public`);
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone TEXT,
        team_pick TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id SERIAL PRIMARY KEY,
        espn_id TEXT,
        phase TEXT NOT NULL CHECK(phase IN ('group','r32','r16','qf','sf','3rd','final')),
        group_name TEXT,
        home_team TEXT NOT NULL,
        away_team TEXT NOT NULL,
        match_date TIMESTAMPTZ NOT NULL,
        venue TEXT NOT NULL DEFAULT '',
        home_score INTEGER,
        away_score INTEGER,
        status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','live','finished'))
      );
    `);

    // Migrations for existing deployments
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;`).catch(() => {});
    await client.query(`ALTER TABLE games ADD COLUMN IF NOT EXISTS espn_id TEXT;`).catch(() => {});
    await client.query(`ALTER TABLE games ADD COLUMN IF NOT EXISTS venue TEXT NOT NULL DEFAULT '';`).catch(() => {});
    await client.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS games_espn_id_idx ON games(espn_id) WHERE espn_id IS NOT NULL;`
    ).catch(() => {});

    await client.query(`
      CREATE TABLE IF NOT EXISTS bets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        game_id INTEGER NOT NULL REFERENCES games(id),
        home_score INTEGER NOT NULL,
        away_score INTEGER NOT NULL,
        placed_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, game_id)
      );
    `);

    // Seed admin user
    const adminHash = bcrypt.hashSync('hikma2026admin', 10);
    await client.query(
      `INSERT INTO users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING`,
      ['admin', adminHash]
    );

    console.log('DB initialized — run admin sync to populate games');
  } finally {
    client.release();
  }
}
