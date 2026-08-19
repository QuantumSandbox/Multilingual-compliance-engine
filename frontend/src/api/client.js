import axios from "axios";

export const TOKEN_KEY = "ce_token";

const client = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }
    return Promise.reject(error);
  }
);

export default client;

// ---- Auth ----
export async function login(username, password) {
  // Backend uses OAuth2PasswordRequestForm -> form-encoded body
  const body = new URLSearchParams({ username, password });
  const { data } = await client.post("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data;
}

export async function fetchMe() {
  const { data } = await client.get("/auth/me");
  return data;
}

// ---- Dashboard ----
export async function fetchStats() {
  const { data } = await client.get("/dashboard/stats");
  return data;
}

// ---- Documents ----
export async function fetchDocuments() {
  const { data } = await client.get("/documents");
  return data;
}

export async function uploadDocument(formData) {
  const { data } = await client.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function compareDocument(docId) {
  const { data } = await client.post(`/documents/${docId}/compare`);
  return data;
}

// ---- Tasks ----
export async function fetchTasks(params = {}) {
  const { data } = await client.get("/tasks", { params });
  return data;
}

export async function updateTask(taskId, payload) {
  const { data } = await client.patch(`/tasks/${taskId}`, payload);
  return data;
}

// ---- Conflicts ----
export async function fetchConflicts() {
  const { data } = await client.get("/conflicts");
  return data;
}

export async function resolveConflict(conflictId) {
  const { data } = await client.post(`/conflicts/${conflictId}/resolve`);
  return data;
}

// ---- Citations ----
export async function fetchCitation(taskId) {
  const { data } = await client.get(`/citations/${taskId}`);
  return data;
}

export function fileUrl(docId) {
  return `/api/citations/file/${docId}`;
}
