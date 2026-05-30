// Controls the brand identity of the app. Set VITE_APP_THEME=family in the
// Vercel environment to deploy the Familia GF & CC edition.

export interface AppTheme {
  id: 'hikma' | 'family';
  logoText: string;
  appFooter: string;
  heroTagline: string;
  heroSubtitle: string;
  heroPhoto: string | null;   // null → gradient fallback rendered in component
  rulesPhoto: string | null;
  authPhoto: string | null;
  multiLang: boolean;         // show EN/PT language toggle
}

const hikma: AppTheme = {
  id: 'hikma',
  logoText: 'hikma.',
  appFooter: 'Grupo Hikma • Copa do Mundo 2026',
  heroTagline: 'Copa Hikma 2026',
  heroSubtitle: 'May the best predictor win',
  heroPhoto: '/hikma-lab.png',
  rulesPhoto: '/hikma-factory.png',
  authPhoto: '/hikma-cleanroom.png',
  multiLang: true,
};

const family: AppTheme = {
  id: 'family',
  logoText: 'familia.',
  appFooter: 'Familia GF & CC • Copa do Mundo 2026',
  heroTagline: 'Familia GF & CC',
  heroSubtitle: 'Que vença o melhor!',
  heroPhoto: null,
  rulesPhoto: null,
  authPhoto: null,
  multiLang: false,
};

const themeId = import.meta.env.VITE_APP_THEME === 'family' ? 'family' : 'hikma';
export const theme: AppTheme = themeId === 'family' ? family : hikma;
export default theme;
