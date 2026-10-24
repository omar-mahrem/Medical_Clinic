export const environment = {
  production: true,
  apiUrl: typeof window !== 'undefined' && window.location.port === '4200' ? 'http://localhost:5000' : ''
};

