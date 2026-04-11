const API_URL = 'http://localhost:3002/api';

export function authFetch(url: string, options: any = {}) {
  const token = localStorage.getItem('token');

  return fetch(API_URL + url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
}