/**
 * Minimal API client for the Resume Screening Assistant.
 *
 * Base URL resolution (in priority order):
 *  1) REACT_APP_RESUME_BACKEND_BASE_URL   (canonical)
 *  2) REACT_APP_API_BASE                  (legacy/alternate)
 *  3) REACT_APP_BACKEND_URL               (legacy/alternate)
 *  4) http://localhost:3001               (local default for dev/preview)
 *
 * Note: Create React App only exposes env vars prefixed with REACT_APP_.
 */

// We resolve the base URL at runtime from build-time env vars.
// Keeping this logic centralized avoids configuration drift across the app.
function resolveApiBaseUrl() {
  const raw =
    process.env.REACT_APP_RESUME_BACKEND_BASE_URL ||
    process.env.REACT_APP_API_BASE ||
    process.env.REACT_APP_BACKEND_URL ||
    "http://localhost:3001";

  // Normalize: drop trailing slashes.
  return String(raw).replace(/\/+$/, "");
}

const API_BASE_URL = resolveApiBaseUrl();

// PUBLIC_INTERFACE
export function getApiBaseUrl() {
  /** Returns the configured API base URL (never empty due to default fallback). */
  return API_BASE_URL;
}

function buildUrl(path) {
  if (!path) return API_BASE_URL;
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
