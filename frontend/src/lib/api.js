const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function api(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* empty */
  }
  if (!res.ok) {
    throw new Error(data.detail || data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const authApi = {
  register: (body) => api("/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => api("/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => api("/me"),
};

export const chatApi = {
  newSession: () => api("/chat/session", { method: "POST" }),
  welcome: (session_id) =>
    api("/chat/welcome", { method: "POST", body: JSON.stringify({ session_id }) }),
  send: (session_id, message) =>
    api("/chat", { method: "POST", body: JSON.stringify({ session_id, message }) }),
  listSessions: () => api("/chat/sessions"),
  getSession: (sessionId) => api(`/chat/sessions/${sessionId}`),
};

export const placesApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return api(`/places${q ? `?${q}` : ""}`);
  },
  recommend: (body) => api("/recommend", { method: "POST", body: JSON.stringify(body) }),
};
