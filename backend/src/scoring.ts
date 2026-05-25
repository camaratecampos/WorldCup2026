export type Phase = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | '3rd' | 'final';

const PHASE_TREND_POINTS: Record<Phase, number> = {
  group: 4,
  r32: 6,
  r16: 8,
  qf: 10,
  sf: 13,
  '3rd': 13,
  final: 15,
};

const EXACT_BONUS = 2;

export type Trend = 'H' | 'D' | 'A'; // Home win, Draw, Away win

export function getTrend(homeScore: number, awayScore: number): Trend {
  if (homeScore > awayScore) return 'H';
  if (homeScore === awayScore) return 'D';
  return 'A';
}

export function calculateBetPoints(
  phase: Phase,
  betHome: number,
  betAway: number,
  actualHome: number,
  actualAway: number
): number {
  const betTrend = getTrend(betHome, betAway);
  const actualTrend = getTrend(actualHome, actualAway);

  if (betTrend !== actualTrend) return 0;

  const basePoints = PHASE_TREND_POINTS[phase];
  const exactBonus =
    betHome === actualHome && betAway === actualAway ? EXACT_BONUS : 0;

  return basePoints + exactBonus;
}

export type TeamPickResult = 'none' | 'semi_lost' | 'final_lost' | 'winner';

export function calculateTeamPickPoints(result: TeamPickResult): number {
  switch (result) {
    case 'semi_lost':
      return 12;
    case 'final_lost':
      return 20;
    case 'winner':
      return 30;
    default:
      return 0;
  }
}

export interface BetWithGame {
  bet_home: number;
  bet_away: number;
  actual_home: number;
  actual_away: number;
  phase: Phase;
}

export function calculateTotalPoints(betsWithGames: BetWithGame[]): number {
  return betsWithGames.reduce((sum, item) => {
    return sum + calculateBetPoints(
      item.phase,
      item.bet_home,
      item.bet_away,
      item.actual_home,
      item.actual_away
    );
  }, 0);
}
