const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://tedarik-backend.onrender.com/api";

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