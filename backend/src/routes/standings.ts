import { Router, Request, Response } from 'express';
import db from '../db';
import { calculateBetPoints, calculateTeamPickPoints, Phase, getTrend } from '../scoring';

const router = Router();

interface UserRow {
  id: number;
  username: string;
  team_pick: string | null;
}

interface BetRow {
  user_id: number;
  game_id: number;
  home_score: number;
  away_score: number;
  phase: Phase;
  actual_home: number | null;
  actual_away: number | null;
  status: string;
}

interface GameRow {
  id: number;
  phase: Phase;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
}

function computeTeamPickBonus(teamPick: string | null): number {
  if (!teamPick) return 0;

  // Check if team won the final
  const finalGame = db.prepare(
    "SELECT * FROM games WHERE phase = 'final' AND status = 'finished'"
  ).get() as GameRow | undefined;

  if (finalGame && finalGame.home_score != null && finalGame.away_score != null) {
    const finalTrend = getTrend(finalGame.home_score, finalGame.away_score);
    const winner = finalTrend === 'H' ? finalGame.home_team : finalTrend === 'A' ? finalGame.away_team : null;
    const loser = finalTrend === 'H' ? finalGame.away_team : finalTrend === 'A' ? finalGame.home_team : null;

    if (winner === teamPick) return calculateTeamPickPoints('winner');
    if (loser === teamPick) return calculateTeamPickPoints('final_lost');
  }

  // Check if team lost in semi-finals
  const sfGames = db.prepare(
    "SELECT * FROM games WHERE phase = 'sf' AND status = 'finished'"
  ).all() as GameRow[];

  for (const sf of sfGames) {
    if (sf.home_score != null && sf.away_score != null) {
      const trend = getTrend(sf.home_score, sf.away_score);
      const loser = trend === 'H' ? sf.away_team : trend === 'A' ? sf.home_team : null;
      if (loser === teamPick) return calculateTeamPickPoints('semi_lost');
    }
  }

  // Check if team is still in the tournament (in final or sf but not finished)
  const sfActive = db.prepare(
    "SELECT * FROM games WHERE phase IN ('sf', 'final') AND (home_team = ? OR away_team = ?)"
  ).all(teamPick, teamPick) as GameRow[];

  if (sfActive.length > 0) {
    // Team reached semi or final - partial points not awarded yet
    return 0;
  }

  return 0;
}

// GET /api/standings - participant leaderboard
router.get('/', (req: Request, res: Response): void => {
  const users = db.prepare('SELECT id, username, team_pick FROM users').all() as UserRow[];

  const bets = db.prepare(`
    SELECT b.user_id, b.game_id, b.home_score, b.away_score,
           g.phase, g.home_score as actual_home, g.away_score as actual_away, g.status
    FROM bets b
    JOIN games g ON b.game_id = g.id
    WHERE g.status = 'finished'
  `).all() as BetRow[];

  // Group bets by user
  const betsByUser: Record<number, BetRow[]> = {};
  for (const bet of bets) {
    if (!betsByUser[bet.user_id]) betsByUser[bet.user_id] = [];
    betsByUser[bet.user_id].push(bet);
  }

  const standings = users.map((user) => {
    const userBets = betsByUser[user.id] || [];
    let betPoints = 0;
    let gamesBet = 0;
    let gamesWithPoints = 0;

    for (const bet of userBets) {
      if (bet.actual_home != null && bet.actual_away != null) {
        const pts = calculateBetPoints(
          bet.phase,
          bet.home_score,
          bet.away_score,
          bet.actual_home,
          bet.actual_away
        );
        betPoints += pts;
        gamesBet++;
        if (pts > 0) gamesWithPoints++;
      }
    }

    const teamPickBonus = computeTeamPickBonus(user.team_pick);
    const totalPoints = betPoints + teamPickBonus;

    return {
      userId: user.id,
      username: user.username,
      teamPick: user.team_pick,
      totalPoints,
      betPoints,
      teamPickBonus,
      gamesBet,
      gamesWithPoints,
    };
  });

  standings.sort((a, b) => b.totalPoints - a.totalPoints);

  // Add rank
  const ranked = standings.map((s, i) => ({ ...s, rank: i + 1 }));

  res.json(ranked);
});

// GET /api/results - games with results and bets for current user
router.get('/results', (req: Request, res: Response): void => {
  // This is handled separately - just re-export or handle inline
  res.json([]);
});

export default router;
