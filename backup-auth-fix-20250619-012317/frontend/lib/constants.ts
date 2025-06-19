export const ASSETS = {
  IMAGES: {
    PLACEHOLDER: '/assets/images/placeholder-game.jpg',
    LOGO: '/assets/images/logo.png',
    DEFAULT_AVATAR: '/assets/images/default-avatar.png',
  },
  ICONS: {
    DASHBOARD: '/assets/icons/dashboard.svg',
    GAMES: '/assets/icons/games.svg',
    PROFILE: '/assets/icons/profile.svg',
    SETTINGS: '/assets/icons/settings.svg',
  }
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/user/dashboard',
  GAMES: '/user/games',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ADMIN: '/admin',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    SESSION: '/api/auth/session',
  },
  GAMES: {
    LIST: '/api/games',
    DETAIL: (id: string) => `/api/games/${id}`,
  },
  USER: {
    PROFILE: '/api/user/profile',
    SETTINGS: '/api/user/settings',
  }
}; 