const API_URL = '/api';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Error al iniciar sesión');
  }

  return data.data;
}

export async function getMe(token: string) {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.message || 'Error al obtener datos de usuario');
  }

  return data.data;
}
