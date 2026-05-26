const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (username: string, password: string) =>
    request<{ token: string; username: string; userId: number }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  register: (username: string, password: string) =>
    request<{ token: string; username: string; userId: number }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // User
  getMe: () => request<{ id: number; username: string; teamPick: string | null; isAdmin: boolean }>('/me'),

  renameMe: (username: string) =>
    request<{ token: string; username: string }>('/me/username', {
      method: 'PUT',
      body: JSON.stringify({ username }),
    }),

  setTeamPick: (team: string) =>
    request<{ success: boolean; team: string }>('/team-pick', {
      method: 'POST',
      body: JSON.stringify({ team }),
    }),

  // Games
  getGames: () => request<import('./types').Game[]>('/games'),

  getGamesByDate: (date: string) => request<import('./types').Game[]>(`/games/date/${date}`),

  // Bets
  placeBet: (gameId: number, homeScore: number, awayScore: number) =>
    request<{ success: boolean }>('/bets', {
      method: 'POST',
      body: JSON.stringify({ gameId, homeScore, awayScore }),
    }),

  getMyBets: () => request<import('./types').Bet[]>('/bets/my'),

  // Standings
  getStandings: () => request<import('./types').StandingEntry[]>('/standings'),

  // Results
  getResults: () => request<import('./types').GameWithBet[]>('/results'),

  // Groups
  getGroups: () => request<Record<string, import('./types').TeamStats[]>>('/groups'),
  getThirdPlace: () => request<(import('./types').TeamStats & { group: string })[]>('/groups/third'),

  // Admin
  checkAdmin: () => request<{ isAdmin: boolean }>('/admin/check'),

  setResult: (gameId: number, homeScore: number, awayScore: number) =>
    request<{ success: boolean }>('/admin/result', {
      method: 'POST',
      body: JSON.stringify({ gameId, homeScore, awayScore }),
    }),

  syncESPN: () =>
    request<{ success: boolean; synced: number; errors: string[] }>('/admin/sync', { method: 'POST' }),

  adminGetUsers: () =>
    request<{ id: number; username: string }[]>('/admin/users'),

  adminRenameUser: (userId: number, username: string) =>
    request<{ success: boolean; userId: number; username: string }>(`/admin/users/${userId}/username`, {
      method: 'PUT',
      body: JSON.stringify({ username }),
    }),
};

export default api;
