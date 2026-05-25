import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

interface GroupGame {
  id: number;
  group_name: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
}

interface TeamStats {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

function buildGroupsMap(games: GroupGame[]): Record<string, Record<string, TeamStats>> {
  const groupsMap: Record<string, Record<string, TeamStats>> = {};

  for (const game of games) {
    const grp = game.group_name;
    if (!groupsMap[grp]) groupsMap[grp] = {};

    if (!groupsMap[grp][game.home_team]) {
      groupsMap[grp][game.home_team] = {
        team: game.home_team,
        played: 0, won: 0, drawn: 0, lost: 0,
        gf: 0, ga: 0, gd: 0, pts: 0
      };
    }
    if (!groupsMap[grp][game.away_team]) {
      groupsMap[grp][game.away_team] = {
        team: game.away_team,
        played: 0, won: 0, drawn: 0, lost: 0,
        gf: 0, ga: 0, gd: 0, pts: 0
      };
    }

    if (game.status === 'finished' && game.home_score != null && game.away_score != null) {
      const home = groupsMap[grp][game.home_team];
      const away = groupsMap[grp][game.away_team];

      home.played++;
      away.played++;
      home.gf += game.home_score;
      home.ga += game.away_score;
      away.gf += game.away_score;
      away.ga += game.home_score;

      if (game.home_score > game.away_score) {
        home.won++; home.pts += 3;
        away.lost++;
      } else if (game.home_score === game.away_score) {
        home.drawn++; home.pts++;
        away.drawn++; away.pts++;
      } else {
        away.won++; away.pts += 3;
        home.lost++;
      }

      home.gd = home.gf - home.ga;
      away.gd = away.gf - away.ga;
    }
  }

  return groupsMap;
}

function sortTeams(teams: TeamStats[]): TeamStats[] {
  return teams.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd !== a.gd) return b.gd - a.gd;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.team.localeCompare(b.team);
  });
}

// GET /api/groups - group stage standings
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const games = await query<GroupGame>(`
      SELECT id, group_name, home_team, away_team, home_score, away_score, status
      FROM games
      WHERE phase = 'group'
      ORDER BY group_name, match_date ASC
    `);

    const groupsMap = buildGroupsMap(games);

    // Sort each group
    const result: Record<string, TeamStats[]> = {};
    for (const [grp, teams] of Object.entries(groupsMap)) {
      result[grp] = sortTeams(Object.values(teams));
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/groups/third - third place standings
router.get('/third', async (req: Request, res: Response): Promise<void> => {
  try {
    const games = await query<GroupGame>(`
      SELECT id, group_name, home_team, away_team, home_score, away_score, status
      FROM games
      WHERE phase = 'group'
      ORDER BY group_name, match_date ASC
    `);

    const groupsMap = buildGroupsMap(games);

    // Get 3rd place team from each group
    const thirdPlaceTeams: (TeamStats & { group: string })[] = [];
    for (const [grp, teams] of Object.entries(groupsMap)) {
      const sorted = sortTeams(Object.values(teams));
      if (sorted.length >= 3) {
        thirdPlaceTeams.push({ ...sorted[2], group: grp });
      }
    }

    // Sort all third place teams
    thirdPlaceTeams.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      if (b.gf !== a.gf) return b.gf - a.gf;
      return a.team.localeCompare(b.team);
    });

    res.json(thirdPlaceTeams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
