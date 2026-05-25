const teamCodes: Record<string, string> = {
  // Group A
  Mexico: 'mx', 'South Africa': 'za', 'Korea Republic': 'kr', Czechia: 'cz',
  // Group B
  Canada: 'ca', 'Bosnia and Herzegovina': 'ba', Qatar: 'qa', Switzerland: 'ch',
  // Group C
  Brazil: 'br', Morocco: 'ma', Haiti: 'ht', Scotland: 'gb-sct',
  // Group D
  USA: 'us', Paraguay: 'py', Australia: 'au', 'Türkiye': 'tr',
  // Group E
  Germany: 'de', 'Curaçao': 'cw', "Côte d'Ivoire": 'ci', Ecuador: 'ec',
  // Group F
  Netherlands: 'nl', Japan: 'jp', Sweden: 'se', Tunisia: 'tn',
  // Group G
  Belgium: 'be', Egypt: 'eg', 'IR Iran': 'ir', 'New Zealand': 'nz',
  // Group H
  Spain: 'es', 'Cabo Verde': 'cv', 'Saudi Arabia': 'sa', Uruguay: 'uy',
  // Group I
  France: 'fr', Senegal: 'sn', Iraq: 'iq', Norway: 'no',
  // Group J
  Argentina: 'ar', Algeria: 'dz', Austria: 'at', Jordan: 'jo',
  // Group K
  Portugal: 'pt', 'Congo DR': 'cd', Uzbekistan: 'uz', Colombia: 'co',
  // Group L
  England: 'gb-eng', Croatia: 'hr', Ghana: 'gh', Panama: 'pa',
};

export function getFlagUrl(team: string): string {
  const code = teamCodes[team];
  if (!code) return '';
  return `https://flagcdn.com/w40/${code}.png`;
}

export function getFlag(team: string): string {
  return getFlagUrl(team);
}

export const allTeams = Object.keys(teamCodes);

export const teamsByGroup: Record<string, string[]> = {
  A: ['Mexico', 'South Africa', 'Korea Republic', 'Czechia'],
  B: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
  C: ['Brazil', 'Morocco', 'Haiti', 'Scotland'],
  D: ['USA', 'Paraguay', 'Australia', 'Türkiye'],
  E: ['Germany', 'Curaçao', "Côte d'Ivoire", 'Ecuador'],
  F: ['Netherlands', 'Japan', 'Sweden', 'Tunisia'],
  G: ['Belgium', 'Egypt', 'IR Iran', 'New Zealand'],
  H: ['Spain', 'Cabo Verde', 'Saudi Arabia', 'Uruguay'],
  I: ['France', 'Senegal', 'Iraq', 'Norway'],
  J: ['Argentina', 'Algeria', 'Austria', 'Jordan'],
  K: ['Portugal', 'Congo DR', 'Uzbekistan', 'Colombia'],
  L: ['England', 'Croatia', 'Ghana', 'Panama'],
};
