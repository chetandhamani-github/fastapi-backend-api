const API_BASE = '/api';

export function getToken() {
  return localStorage.getItem('conduit_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('conduit_token', token);
  } else {
    localStorage.removeItem('conduit_token');
  }
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    if (!response.ok) {
      throw new Error(text || `Server error (${response.status})`);
    }
    return null;
  }

  if (!response.ok) {
    const errorMsg = data.errors
      ? Object.entries(data.errors)
          .map(([k, v]) => `${k} ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('\n')
      : data.message || data.detail || 'An unexpected error occurred';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ user: { email, password } }),
    }),
  register: (username, email, password) =>
    request('/users', {
      method: 'POST',
      body: JSON.stringify({ user: { username, email, password } }),
    }),
  getCurrentUser: () => request('/user'),
  updateUser: (userData) =>
    request('/user', {
      method: 'PUT',
      body: JSON.stringify({ user: userData }),
    }),

  // Profiles
  getProfile: (username) => request(`/profiles/${username}`),
  followUser: (username) =>
    request(`/profiles/${username}/follow`, { method: 'POST' }),
  unfollowUser: (username) =>
    request(`/profiles/${username}/follow`, { method: 'DELETE' }),

  // Articles
  getArticles: (params = {}) => {
    const query = new URLSearchParams();
    if (params.tag) query.set('tag', params.tag);
    if (params.author) query.set('author', params.author);
    if (params.favorited) query.set('favorited', params.favorited);
    if (params.limit !== undefined) query.set('limit', params.limit);
    if (params.offset !== undefined) query.set('offset', params.offset);
    return request(`/articles?${query.toString()}`);
  },
  getFeed: (params = {}) => {
    const query = new URLSearchParams();
    if (params.limit !== undefined) query.set('limit', params.limit);
    if (params.offset !== undefined) query.set('offset', params.offset);
    return request(`/articles/feed?${query.toString()}`);
  },
  getArticle: (slug) => request(`/articles/${slug}`),
  createArticle: (article) =>
    request('/articles', {
      method: 'POST',
      body: JSON.stringify({ article }),
    }),
  updateArticle: (slug, article) =>
    request(`/articles/${slug}`, {
      method: 'PUT',
      body: JSON.stringify({ article }),
    }),
  deleteArticle: (slug) =>
    request(`/articles/${slug}`, {
      method: 'DELETE',
    }),
  favoriteArticle: (slug) =>
    request(`/articles/${slug}/favorite`, { method: 'POST' }),
  unfavoriteArticle: (slug) =>
    request(`/articles/${slug}/favorite`, { method: 'DELETE' }),

  // Comments
  getComments: (slug) => request(`/articles/${slug}/comments`),
  addComment: (slug, body) =>
    request(`/articles/${slug}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment: { body } }),
    }),
  deleteComment: (slug, commentId) =>
    request(`/articles/${slug}/comments/${commentId}`, { method: 'DELETE' }),

  // Tags
  getTags: () => request('/tags'),
};
