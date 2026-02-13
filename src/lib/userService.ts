export async function fetchCurrentUser(): Promise<any | null> {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const res = await fetch('/api/user/profile', { headers: { 'authorization': `Bearer ${token}` } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (e) {
    console.error('fetchCurrentUser error', e);
    return null;
  }
}

export function notifyUserChanged() {
  try {
    window.dispatchEvent(new Event('userChanged'));
  } catch (e) {
    // ignore
  }
}
