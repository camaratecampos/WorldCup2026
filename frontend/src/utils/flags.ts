export const teamFlags: Record<string, string> = {
  // Group A
  Mexico: '🇲🇽',
  USA: '🇺🇸',
  Canada: '🇨🇦',
  Panama: '🇵🇦',
  // Group B
  Germany: '🇩🇪',
  Japan: '🇯🇵',
  Chile: '🇨🇱',
  'South Africa': '🇿🇦',
  // Group C
  Spain: '🇪🇸',
  Brazil: '🇧🇷',
  'Ivory Coast': '🇨🇮',
  Serbia: '🇷🇸',
  // Group D
  France: '🇫🇷',
  Argentina: '🇦🇷',
  'New Zealand': '🇳🇿',
  Morocco: '🇲🇦',
  // Group E
  England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Colombia: '🇨🇴',
  Ukraine: '🇺🇦',
  Senegal: '🇸🇳',
  // Group F
  Portugal: '🇵🇹',
  Netherlands: '🇳🇱',
  Ecuador: '🇪🇨',
  'Saudi Arabia': '🇸🇦',
  // Group G
  Belgium: '🇧🇪',
  Uruguay: '🇺🇾',
  Algeria: '🇩🇿',
  Nigeria: '🇳🇬',
  // Group H
  Italy: '🇮🇹',
  Australia: '🇦🇺',
  'South Korea': '🇰🇷',
  Iran: '🇮🇷',
  // Group I
  Croatia: '🇭🇷',
  Egypt: '🇪🇬',
  Switzerland: '🇨🇭',
  Thailand: '🇹🇭',
  // Group J
  Turkey: '🇹🇷',
  Denmark: '🇩🇰',
  Cameroon: '🇨🇲',
  Honduras: '🇭🇳',
  // Group K
  Austria: '🇦🇹',
  Paraguay: '🇵🇾',
  Ghana: '🇬🇭',
  'El Salvador': '🇸🇻',
  // Group L
  Poland: '🇵🇱',
  Peru: '🇵🇪',
  'Congo DR': '🇨🇩',
  Tunisia: '🇹🇳',
};

export function getFlag(team: string): string {
  return teamFlags[team] || '🏳️';
}

export const allTeams = Object.keys(teamFlags);

export const teamsByGroup: Record<string, string[]> = {
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
