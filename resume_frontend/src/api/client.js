/**
 * Minimal API client for the Resume Screening Assistant.
 * Uses REACT_APP_RESUME_BACKEND_BASE_URL from environment.
 */

const API_BASE_URL =
  (process.env.REACT_APP_RESUME_BACKEND_BASE_URL || "").replace(/\/+$/, "");

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the configured API base URL (empty string if not set). */
  return API_BASE_URL;
}

function buildUrl(path) {
  if (!API_BASE_URL) return path; // allows relative paths during dev if proxy is later added
  if (!path.startsWith("/")) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}${path}`;
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function request(path, options = {}) {
  const url = buildUrl(path);
  const res = await fetch(url, options);
  if (!res.ok) {
    const payload = await readJson(res);
    const msg = payload?.detail || payload?.message || res.statusText;
    const err = new Error(`Request failed (${res.status}): ${msg}`);
    err.status = res.status;
    err.payload = payload;
    throw err;
  }
  return readJson(res);
}

// PUBLIC_INTERFACE
export async function uploadResumes(files) {
  /** Upload one or multiple resume files to be parsed by the backend. */
  const form = new FormData();
  for (const f of files) form.append("files", f);

  // Backend spec is minimal in current running service; we assume canonical path.
  // If backend differs, only adjust these paths.
  return request("/api/resumes/upload", {
    method: "POST",
    body: form
  });
}

// PUBLIC_INTERFACE
export async function createCriteria(criteria) {
  /** Create a criteria object used for ranking candidates. */
  return request("/api/criteria", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(criteria)
  });
}

// PUBLIC_INTERFACE
export async function rankCandidates(criteriaId) {
  /** Trigger ranking for a criteria set; returns ranked results. */
  return request(`/api/rankings/run?criteria_id=${encodeURIComponent(criteriaId)}`, {
    method: "POST"
  });
}

// PUBLIC_INTERFACE
export async function listRankings(params = {}) {
  /** List ranking results (optionally filtered). */
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.set(k, String(v));
  });
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return request(`/api/rankings${suffix}`, { method: "GET" });
}

// PUBLIC_INTERFACE
export async function listResumes() {
  /** List parsed resumes currently stored. */
  return request("/api/resumes", { method: "GET" });
}
