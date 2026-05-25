const teamCodes: Record<string, string> = {
  // Group A
  Mexico: 'mx', USA: 'us', Canada: 'ca', Panama: 'pa',
  // Group B
  Germany: 'de', Japan: 'jp', Chile: 'cl', 'South Africa': 'za',
  // Group C
  Spain: 'es', Brazil: 'br', 'Ivory Coast': 'ci', Serbia: 'rs',
  // Group D
  France: 'fr', Argentina: 'ar', 'New Zealand': 'nz', Morocco: 'ma',
  // Group E
  England: 'gb-eng', Colombia: 'co', Ukraine: 'ua', Senegal: 'sn',
  // Group F
  Portugal: 'pt', Netherlands: 'nl', Ecuador: 'ec', 'Saudi Arabia': 'sa',
  // Group G
  Belgium: 'be', Uruguay: 'uy', Algeria: 'dz', Nigeria: 'ng',
  // Group H
  Italy: 'it', Australia: 'au', 'South Korea': 'kr', Iran: 'ir',
  // Group I
  Croatia: 'hr', Egypt: 'eg', Switzerland: 'ch', Thailand: 'th',
  // Group J
  Turkey: 'tr', Denmark: 'dk', Cameroon: 'cm', Honduras: 'hn',
  // Group K
  Austria: 'at', Paraguay: 'py', Ghana: 'gh', 'El Salvador': 'sv',
  // Group L
  Poland: 'pl', Peru: 'pe', 'Congo DR': 'cd', Tunisia: 'tn',
};

export function getFlagUrl(team: string): string {
  const code = teamCodes[team];
  if (!code) return '';
  return `https://flagcdn.com/w40/${code}.png`;
}

// kept for backwards compat but prefer getFlagUrl
export function getFlag(team: string): string {
  return getFlagUrl(team);
}

export const allTeams = Object.keys(teamCodes);

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
