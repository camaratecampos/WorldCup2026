import https from 'https';
import { query, execute, queryOne } from './db';

const TEAM_MAP: Record<string, string> = {
  'Mexico': 'Mexico',
  'South Africa': 'South Africa',
  'South Korea': 'Korea Republic',
  'Republic of Korea': 'Korea Republic',
  'Korea Republic': 'Korea Republic',
  'Czech Republic': 'Czechia',
  'Czechia': 'Czechia',
  'Canada': 'Canada',
  'Bosnia and Herzegovina': 'Bosnia and Herzegovina',
  'Bosnia-Herzegovina': 'Bosnia and Herzegovina',
  'Qatar': 'Qatar',
  'Switzerland': 'Switzerland',
  'Brazil': 'Brazil',
  'Morocco': 'Morocco',
  'Haiti': 'Haiti',
  'Scotland': 'Scotland',
  'United States': 'USA',
  'USA': 'USA',
  'Paraguay': 'Paraguay',
  'Australia': 'Australia',
  'Turkey': 'Türkiye',
  'Turkiye': 'Türkiye',
  'Türkiye': 'Türkiye',
  'Germany': 'Germany',
  'Curacao': 'Curaçao',
  "Curaçao": 'Curaçao',
  "Cote d'Ivoire": "Côte d'Ivoire",
  "Côte d'Ivoire": "Côte d'Ivoire",
  "Ivory Coast": "Côte d'Ivoire",
  'Ecuador': 'Ecuador',
  'Netherlands': 'Netherlands',
  'Japan': 'Japan',
  'Sweden': 'Sweden',
  'Tunisia': 'Tunisia',
  'Belgium': 'Belgium',
  'Egypt': 'Egypt',
  'Iran': 'IR Iran',
  'IR Iran': 'IR Iran',
  'New Zealand': 'New Zealand',
  'Spain': 'Spain',
  'Cape Verde': 'Cabo Verde',
  'Cabo Verde': 'Cabo Verde',
  'Saudi Arabia': 'Saudi Arabia',
  'Uruguay': 'Uruguay',
  'France': 'France',
  'Senegal': 'Senegal',
  'Iraq': 'Iraq',
  'Norway': 'Norway',
  'Argentina': 'Argentina',
  'Algeria': 'Algeria',
  'Austria': 'Austria',
  'Jordan': 'Jordan',
  'Portugal': 'Portugal',
  'DR Congo': 'Congo DR',
  'Congo DR': 'Congo DR',
  'Democratic Republic of Congo': 'Congo DR',
  'Uzbekistan': 'Uzbekistan',
  'Colombia': 'Colombia',
  'England': 'England',
  'Croatia': 'Croatia',
  'Ghana': 'Ghana',
  'Panama': 'Panama',
};

function normalizeTeam(name: string): string {
  return TEAM_MAP[name] || name;
}

function getPhase(noteText: string, matchDate: Date): string {
  const n = noteText.toLowerCase();
  if (n.includes('group')) return 'group';
  if (n.includes('round of 32') || n.includes('last 32') || n.includes('32nd')) return 'r32';
  if (n.includes('round of 16') || n.includes('last 16') || n.includes('16th')) return 'r16';
  if (n.includes('quarter')) return 'qf';
  if (n.includes('third') || n.includes('3rd place') || n.includes('bronze')) return '3rd';
  if (n.includes('semi')) return 'sf';
  if (n.includes('final')) return 'final';

  // Fallback by date
  const t = matchDate.getTime();
  if (t < new Date('2026-06-28').getTime()) return 'group';
  if (t < new Date('2026-07-04').getTime()) return 'r32';
  if (t < new Date('2026-07-09').getTime()) return 'r16';
  if (t < new Date('2026-07-14').getTime()) return 'qf';
  if (t < new Date('2026-07-18').getTime()) return 'sf';
  if (t < new Date('2026-07-19').getTime()) return '3rd';
  return 'final';
}

function httpsGet(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk: string) => (data += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function fetchEventsForDate(yyyymmdd: string): Promise<unknown[]> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${yyyymmdd}`;
    const data = await httpsGet(url) as Record<string, unknown>;
    return (data.events as unknown[]) || [];
  } catch {
    return [];
  }
}

export async function syncFromESPN(): Promise<{ synced: number; errors: string[] }> {
  const errors: string[] = [];

  // Try to fetch all at once first (some ESPN endpoints support ranges)
  let allEvents: unknown[] = [];
  try {
    const rangeData = await httpsGet(
      'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=200'
    ) as Record<string, unknown>;
    allEvents = (rangeData.events as unknown[]) || [];
  } catch { /* ignore */ }

  // If range returned too few, fetch day by day in parallel batches
  if (allEvents.length < 50) {
    allEvents = [];
    const dates: string[] = [];
    const d = new Date('2026-06-11');
    const end = new Date('2026-07-20');
    while (d < end) {
      dates.push(d.toISOString().slice(0, 10).replace(/-/g, ''));
      d.setDate(d.getDate() + 1);
    }

    // Fetch in batches of 8 in parallel
    for (let i = 0; i < dates.length; i += 8) {
      const batch = dates.slice(i, i + 8);
      const results = await Promise.all(batch.map(fetchEventsForDate));
      allEvents.push(...results.flat());
    }
  }

  // Deduplicate by ESPN event ID
  const seen = new Set<string>();
  const events = allEvents.filter((e: unknown) => {
    const ev = e as Record<string, unknown>;
    if (!ev.id || seen.has(ev.id as string)) return false;
    seen.add(ev.id as string);
    return true;
  });

  let synced = 0;

  for (const raw of events) {
    const event = raw as Record<string, unknown>;
    const comp = ((event.competitions as unknown[]) || [])[0] as Record<string, unknown> | undefined;
    if (!comp) continue;

    const competitors = (comp.competitors as Record<string, unknown>[]) || [];
    const homeComp = competitors.find((c) => c.homeAway === 'home');
    const awayComp = competitors.find((c) => c.homeAway === 'away');
    if (!homeComp || !awayComp) continue;

    const homeTeamRaw = ((homeComp.team as Record<string, unknown>)?.displayName as string)
      || ((homeComp.team as Record<string, unknown>)?.name as string) || '';
    const awayTeamRaw = ((awayComp.team as Record<string, unknown>)?.displayName as string)
      || ((awayComp.team as Record<string, unknown>)?.name as string) || '';

    const homeTeam = normalizeTeam(homeTeamRaw);
    const awayTeam = normalizeTeam(awayTeamRaw);
    if (!homeTeam || !awayTeam) continue;

    const matchDate = new Date((event.date as string) || (comp.date as string));
    if (isNaN(matchDate.getTime())) continue;

    const venue = ((comp.venue as Record<string, unknown>)?.fullName as string) || '';

    const notes = ((comp.notes as Record<string, unknown>[]) || [])
      .map((n) => n.headline as string || '')
      .join(' ');
    const phase = getPhase(notes, matchDate);

    let groupName: string | null = null;
    const groupMatch = notes.match(/Group\s+([A-L])/i);
    if (groupMatch) groupName = groupMatch[1].toUpperCase();

    const statusType = ((comp.status as Record<string, unknown>)?.type as Record<string, unknown>) || {};
    const isFinished = (statusType.name as string) === 'STATUS_FINAL' || (statusType.completed as boolean) === true;
    const isLive = (statusType.state as string) === 'in';
    const status = isFinished ? 'finished' : isLive ? 'live' : 'scheduled';

    const homeScore = isFinished ? parseInt((homeComp.score as string) || '0', 10) : null;
    const awayScore = isFinished ? parseInt((awayComp.score as string) || '0', 10) : null;

    const espnId = event.id as string;

    try {
      const existing = await queryOne<{ id: number; status: string }>(
        'SELECT id, status FROM games WHERE espn_id = $1',
        [espnId]
      );

      if (existing) {
        // Update result if finished
        if (isFinished) {
          await execute(
            "UPDATE games SET home_score=$1, away_score=$2, status='finished', home_team=$3, away_team=$4, match_date=$5, venue=$6, phase=$7, group_name=$8 WHERE espn_id=$9",
            [homeScore, awayScore, homeTeam, awayTeam, matchDate.toISOString(), venue, phase, groupName, espnId]
          );
        } else {
          await execute(
            'UPDATE games SET home_team=$1, away_team=$2, match_date=$3, venue=$4, phase=$5, group_name=$6 WHERE espn_id=$7',
            [homeTeam, awayTeam, matchDate.toISOString(), venue, phase, groupName, espnId]
          );
        }
      } else {
        await execute(
          `INSERT INTO games (espn_id, phase, group_name, home_team, away_team, match_date, venue, home_score, away_score, status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
           ON CONFLICT DO NOTHING`,
          [espnId, phase, groupName, homeTeam, awayTeam, matchDate.toISOString(), venue, homeScore, awayScore, status]
        );
      }
      synced++;
    } catch (e) {
      errors.push(`${homeTeam} vs ${awayTeam}: ${(e as Error).message}`);
    }
  }

  return { synced, errors };
}
