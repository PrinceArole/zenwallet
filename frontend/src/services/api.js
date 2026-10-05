function getApiBaseUrl() {
  const runtimeUrl = typeof window !== 'undefined'
    ? window.ZENWALLET_CONFIG?.apiBaseUrl
    : '';
  const configuredUrl = runtimeUrl || import.meta.env.VITE_API_URL;
  const apiBaseUrl = configuredUrl || (import.meta.env.DEV ? 'http://localhost:5000/api' : '');

  if (!apiBaseUrl) {
    throw new Error('URL de l’API non configurée. Renseigne apiBaseUrl dans runtime-config.js ou VITE_API_URL.');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(apiBaseUrl);
  } catch {
    throw new Error('URL de l’API invalide. Utilise une URL complète, par exemple https://api.example.com/api.');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('L’URL de l’API doit commencer par http:// ou https://.');
  }

  return apiBaseUrl.replace(/\/+$/, '');
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || data.message || 'Une erreur est survenue.');
    error.status = response.status;
    throw error;
  }
  return data;
}
