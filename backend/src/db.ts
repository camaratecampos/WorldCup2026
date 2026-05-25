import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

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
  // Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      team_pick TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      phase TEXT NOT NULL CHECK(phase IN ('group','r32','r16','qf','sf','3rd','final')),
      group_name TEXT,
      home_team TEXT NOT NULL,
      away_team TEXT NOT NULL,
      match_date TIMESTAMPTZ NOT NULL,
      venue TEXT NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','live','finished'))
    );
  `);

  await pool.query(`
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
  await pool.query(
    `INSERT INTO users (username, password_hash) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING`,
    ['admin', adminHash]
  );

  // Seed games only if table is empty
  const countResult = await pool.query('SELECT COUNT(*) as c FROM games');
  const count = parseInt(countResult.rows[0].c, 10);
  if (count > 0) {
    console.log(`Games already seeded (${count} games)`);
    return;
  }

  const venues = [
    'MetLife Stadium',
    'AT&T Stadium',
    'SoFi Stadium',
    'Rose Bowl',
    "Levi's Stadium",
    'Hard Rock Stadium',
    'Gillette Stadium',
    'Lincoln Financial Field',
    'Arrowhead Stadium',
    'NRG Stadium',
    'Empower Field',
    'BC Place',
    'BMO Field',
    'Estadio Azteca',
    'Estadio Akron',
  ];

  function v(i: number): string {
    return venues[i % venues.length];
  }

  // Group stage: 12 groups × 6 games = 72 games
  const groups: Record<string, [string, string, string, string]> = {
    A: ['Mexico', 'USA', 'Canada', 'Panama'],
    B: ['Germany', 'Japan', 'Chile', 'South Africa'],
    C: ['Spain', 'Brazil', 'Ivory Coast', 'Serbia'],
    D: ['France', 'Argentina', 'New Zealand', 'Morocco'],
    E: ['England', 'Colombia', 'Ukraine', 'Senegal'],
    F: ['Portugal', 'Netherlands', 'Ecuador', 'Saudi Arabia'],
    G: ['Belgium', 'Uruguay', 'Algeria', 'Nigeria'],
    H: ['Italy', 'Australia', 'South Korea', 'Iran'],
    I: ['Croatia', 'Egypt', 'Switzerland', 'Thailand'],
    J: ['Turkey', 'Denmark', 'Cameroon', 'Honduras'],
    K: ['Austria', 'Paraguay', 'Ghana', 'El Salvador'],
    L: ['Poland', 'Peru', 'Congo DR', 'Tunisia'],
  };

  const md1Dates: Record<string, string> = {
    A: '2026-06-11T18:00:00',
    B: '2026-06-11T21:00:00',
    C: '2026-06-12T15:00:00',
    D: '2026-06-12T18:00:00',
    E: '2026-06-13T15:00:00',
    F: '2026-06-13T18:00:00',
    G: '2026-06-14T15:00:00',
    H: '2026-06-14T18:00:00',
    I: '2026-06-15T15:00:00',
    J: '2026-06-15T18:00:00',
    K: '2026-06-16T15:00:00',
    L: '2026-06-16T18:00:00',
  };

  const md2Dates: Record<string, string> = {
    A: '2026-06-17T18:00:00',
    B: '2026-06-17T21:00:00',
    C: '2026-06-18T15:00:00',
    D: '2026-06-18T18:00:00',
    E: '2026-06-19T15:00:00',
    F: '2026-06-19T18:00:00',
    G: '2026-06-20T15:00:00',
    H: '2026-06-20T18:00:00',
    I: '2026-06-21T15:00:00',
    J: '2026-06-21T18:00:00',
    K: '2026-06-22T15:00:00',
    L: '2026-06-22T18:00:00',
  };

  const md3Dates: Record<string, string[]> = {
    A: ['2026-06-26T18:00:00', '2026-06-26T18:00:00'],
    B: ['2026-06-26T21:00:00', '2026-06-26T21:00:00'],
    C: ['2026-06-27T15:00:00', '2026-06-27T15:00:00'],
    D: ['2026-06-27T18:00:00', '2026-06-27T18:00:00'],
    E: ['2026-06-28T15:00:00', '2026-06-28T15:00:00'],
    F: ['2026-06-28T18:00:00', '2026-06-28T18:00:00'],
    G: ['2026-06-29T15:00:00', '2026-06-29T15:00:00'],
    H: ['2026-06-29T18:00:00', '2026-06-29T18:00:00'],
    I: ['2026-06-30T15:00:00', '2026-06-30T15:00:00'],
    J: ['2026-06-30T18:00:00', '2026-06-30T18:00:00'],
    K: ['2026-07-01T15:00:00', '2026-07-01T15:00:00'],
    L: ['2026-07-01T18:00:00', '2026-07-01T18:00:00'],
  };

  interface GameSeed {
    phase: string;
    group_name: string | null;
    home_team: string;
    away_team: string;
    match_date: string;
    venue: string;
  }

  const groupGames: GameSeed[] = [];
  let vi = 0;

  for (const [grp, teams] of Object.entries(groups)) {
    const [t1, t2, t3, t4] = teams;
    // MD1
    groupGames.push({ phase: 'group', group_name: grp, home_team: t1, away_team: t2, match_date: md1Dates[grp], venue: v(vi++) });
    groupGames.push({ phase: 'group', group_name: grp, home_team: t3, away_team: t4, match_date: md1Dates[grp], venue: v(vi++) });
    // MD2
    groupGames.push({ phase: 'group', group_name: grp, home_team: t1, away_team: t3, match_date: md2Dates[grp], venue: v(vi++) });
    groupGames.push({ phase: 'group', group_name: grp, home_team: t2, away_team: t4, match_date: md2Dates[grp], venue: v(vi++) });
    // MD3 (simultaneous)
    groupGames.push({ phase: 'group', group_name: grp, home_team: t1, away_team: t4, match_date: md3Dates[grp][0], venue: v(vi++) });
    groupGames.push({ phase: 'group', group_name: grp, home_team: t2, away_team: t3, match_date: md3Dates[grp][1], venue: v(vi++) });
  }

  // Round of 32: 16 games, Jul 4-8
  const r32Games: GameSeed[] = [
    { phase: 'r32', group_name: null, home_team: 'A1', away_team: 'B2', match_date: '2026-07-04T15:00:00', venue: 'MetLife Stadium' },
    { phase: 'r32', group_name: null, home_team: 'C1', away_team: 'D2', match_date: '2026-07-04T18:00:00', venue: 'AT&T Stadium' },
    { phase: 'r32', group_name: null, home_team: 'E1', away_team: 'F2', match_date: '2026-07-04T21:00:00', venue: 'SoFi Stadium' },
    { phase: 'r32', group_name: null, home_team: 'G1', away_team: 'H2', match_date: '2026-07-05T15:00:00', venue: 'Rose Bowl' },
    { phase: 'r32', group_name: null, home_team: 'I1', away_team: 'J2', match_date: '2026-07-05T18:00:00', venue: "Levi's Stadium" },
    { phase: 'r32', group_name: null, home_team: 'K1', away_team: 'L2', match_date: '2026-07-05T21:00:00', venue: 'Hard Rock Stadium' },
    { phase: 'r32', group_name: null, home_team: 'B1', away_team: 'A2', match_date: '2026-07-06T15:00:00', venue: 'Gillette Stadium' },
    { phase: 'r32', group_name: null, home_team: 'D1', away_team: 'C2', match_date: '2026-07-06T18:00:00', venue: 'Lincoln Financial Field' },
    { phase: 'r32', group_name: null, home_team: 'F1', away_team: 'E2', match_date: '2026-07-06T21:00:00', venue: 'Arrowhead Stadium' },
    { phase: 'r32', group_name: null, home_team: 'H1', away_team: 'G2', match_date: '2026-07-07T15:00:00', venue: 'NRG Stadium' },
    { phase: 'r32', group_name: null, home_team: 'J1', away_team: 'I2', match_date: '2026-07-07T18:00:00', venue: 'Empower Field' },
    { phase: 'r32', group_name: null, home_team: 'L1', away_team: 'K2', match_date: '2026-07-07T21:00:00', venue: 'BC Place' },
    { phase: 'r32', group_name: null, home_team: '3rd1', away_team: '3rd2', match_date: '2026-07-08T15:00:00', venue: 'BMO Field' },
    { phase: 'r32', group_name: null, home_team: '3rd3', away_team: '3rd4', match_date: '2026-07-08T18:00:00', venue: 'Estadio Azteca' },
    { phase: 'r32', group_name: null, home_team: '3rd5', away_team: '3rd6', match_date: '2026-07-08T21:00:00', venue: 'Estadio Akron' },
    { phase: 'r32', group_name: null, home_team: '3rd7', away_team: '3rd8', match_date: '2026-07-08T22:00:00', venue: 'MetLife Stadium' },
  ];

  // Round of 16: 8 games, Jul 10-13
  const r16Games: GameSeed[] = [
    { phase: 'r16', group_name: null, home_team: 'R32W1', away_team: 'R32W2', match_date: '2026-07-10T15:00:00', venue: 'AT&T Stadium' },
    { phase: 'r16', group_name: null, home_team: 'R32W3', away_team: 'R32W4', match_date: '2026-07-10T18:00:00', venue: 'SoFi Stadium' },
    { phase: 'r16', group_name: null, home_team: 'R32W5', away_team: 'R32W6', match_date: '2026-07-11T15:00:00', venue: 'Rose Bowl' },
    { phase: 'r16', group_name: null, home_team: 'R32W7', away_team: 'R32W8', match_date: '2026-07-11T18:00:00', venue: "Levi's Stadium" },
    { phase: 'r16', group_name: null, home_team: 'R32W9', away_team: 'R32W10', match_date: '2026-07-12T15:00:00', venue: 'Hard Rock Stadium' },
    { phase: 'r16', group_name: null, home_team: 'R32W11', away_team: 'R32W12', match_date: '2026-07-12T18:00:00', venue: 'MetLife Stadium' },
    { phase: 'r16', group_name: null, home_team: 'R32W13', away_team: 'R32W14', match_date: '2026-07-13T15:00:00', venue: 'Arrowhead Stadium' },
    { phase: 'r16', group_name: null, home_team: 'R32W15', away_team: 'R32W16', match_date: '2026-07-13T18:00:00', venue: 'NRG Stadium' },
  ];

  // Quarter-finals: 4 games, Jul 14-16
  const qfGames: GameSeed[] = [
    { phase: 'qf', group_name: null, home_team: 'R16W1', away_team: 'R16W2', match_date: '2026-07-14T18:00:00', venue: 'MetLife Stadium' },
    { phase: 'qf', group_name: null, home_team: 'R16W3', away_team: 'R16W4', match_date: '2026-07-15T15:00:00', venue: 'AT&T Stadium' },
    { phase: 'qf', group_name: null, home_team: 'R16W5', away_team: 'R16W6', match_date: '2026-07-15T18:00:00', venue: 'SoFi Stadium' },
    { phase: 'qf', group_name: null, home_team: 'R16W7', away_team: 'R16W8', match_date: '2026-07-16T18:00:00', venue: 'Rose Bowl' },
  ];

  // Semi-finals: 2 games, Jul 18-19
  const sfGames: GameSeed[] = [
    { phase: 'sf', group_name: null, home_team: 'QFW1', away_team: 'QFW2', match_date: '2026-07-18T18:00:00', venue: 'MetLife Stadium' },
    { phase: 'sf', group_name: null, home_team: 'QFW3', away_team: 'QFW4', match_date: '2026-07-19T18:00:00', venue: 'AT&T Stadium' },
  ];

  // 3rd place: Jul 21
  const thirdGame: GameSeed[] = [
    { phase: '3rd', group_name: null, home_team: 'SFL1', away_team: 'SFL2', match_date: '2026-07-21T15:00:00', venue: 'Hard Rock Stadium' },
  ];

  // Final: Jul 22
  const finalGame: GameSeed[] = [
    { phase: 'final', group_name: null, home_team: 'SFW1', away_team: 'SFW2', match_date: '2026-07-22T18:00:00', venue: 'MetLife Stadium' },
  ];

  const allGames = [...groupGames, ...r32Games, ...r16Games, ...qfGames, ...sfGames, ...thirdGame, ...finalGame];

  for (const g of allGames) {
    await pool.query(
      `INSERT INTO games (phase, group_name, home_team, away_team, match_date, venue)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [g.phase, g.group_name, g.home_team, g.away_team, g.match_date, g.venue]
    );
  }

  console.log(`Seeded ${allGames.length} games`);
}
