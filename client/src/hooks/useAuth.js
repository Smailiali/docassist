import { useState, useEffect } from 'react';
import { getMe, logout as apiLogout } from '../services/api.js';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await apiLogout();
    window.location.href = '/login';
  }

  return { user, loading, logout };
}
