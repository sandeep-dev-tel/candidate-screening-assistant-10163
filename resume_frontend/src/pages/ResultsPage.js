import React, { useEffect, useMemo, useState } from "react";
import { Card, Button, Input } from "../components/Layout";
import { listRankings, listResumes } from "../api/client";

function safeJoin(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.filter(Boolean).join(", ");
}

// PUBLIC_INTERFACE
export default function ResultsPage({ initialRanked }) {
  /** Page to view ranked candidates and filter results. */
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [minScore, setMinScore] = useState("0");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [resumes, setResumes] = useState([]);

  const normalized = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = Number(minScore || 0);

    const enriched = results.map((r) => {
      const resumeId = r.resume_id || r.resumeId || r.resume?.id;
      const resume = resumes.find((x) => (x.id || x.resume_id) === resumeId) || r.resume;
      return { ...r, resume };
    });

    return enriched
      .filter((r) => (Number(r.score ?? r.total_score ?? 0) >= min))
      .filter((r) => {
        if (!q) return true;
        const name = (r.resume?.name || r.resume?.candidate_name || r.candidate_name || "").toLowerCase();
        const skills = safeJoin(r.resume?.skills || r.skills).toLowerCase();
        const domain = (r.resume?.domain || r.domain || "").toLowerCase();
        return name.includes(q) || skills.includes(q) || domain.includes(q);
      })
      .sort((a, b) => Number(b.score ?? b.total_score ?? 0) - Number(a.score ?? a.total_score ?? 0));
  }, [results, resumes, query, minScore]);

  const load = async () => {
    setErr("");
    setBusy(true);
    try {
      const [ranks, res] = await Promise.all([listRankings(), listResumes()]);
      setResults(Array.isArray(ranks) ? ranks : (ranks?.items || ranks?.results || []));
      setResumes(Array.isArray(res) ? res : (res?.items || res?.results || []));
    } catch (e) {
      setErr(e.message || "Failed to load results.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (initialRanked) {
      const arr = Array.isArray(initialRanked) ? initialRanked : (initialRanked?.items || initialRanked?.results || []);
      if (arr?.length) setResults(arr);
    }
    // Always load to sync with backend persisted state.
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Card
        title="Filters"
        subtitle="Filter by keyword (name/skills/domain) and minimum score."
        actions={
          <div className="rs-row">
            <Button variant="secondary" onClick={load} disabled={busy}>
              {busy ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        }
      >
        {err ? <div className="rs-alert" role="alert">{err}</div> : null}
        <div className="rs-grid2" style={{ marginTop: 12 }}>
          <Input
            label="Keyword search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., React, healthcare, Alice"
          />
          <Input
            label="Minimum score"
            type="number"
            min="0"
            value={minScore}
            onChange={(e) => setMinScore(e.target.value)}
            placeholder="0"
          />
        </div>
      </Card>

      <Card
        title="Ranked Candidates"
        subtitle={`${normalized.length} candidates shown`}
      >
        <div className="rs-tableWrap" role="region" aria-label="Ranked candidates table">
          <table className="rs-table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>Score</th>
                <th style={{ width: 220 }}>Candidate</th>
                <th>Skills</th>
                <th style={{ width: 160 }}>Domain</th>
                <th style={{ width: 140 }}>Experience</th>
              </tr>
            </thead>
            <tbody>
              {normalized.length ? (
                normalized.map((r, idx) => {
                  const score = Number(r.score ?? r.total_score ?? 0);
                  const resume = r.resume || {};
                  const name = resume.candidate_name || resume.name || r.candidate_name || `Candidate ${idx + 1}`;
                  const skills = safeJoin(resume.skills || r.skills);
                  const domain = resume.domain || r.domain || "";
                  const years = resume.years_experience ?? resume.experience_years ?? r.years_experience ?? r.experience_years;

                  return (
                    <tr key={r.id || r.ranking_id || `${name}-${idx}`}>
                      <td style={{ fontWeight: 800 }}>{score.toFixed ? score.toFixed(1) : score}</td>
                      <td style={{ fontWeight: 700 }}>{name}</td>
                      <td>{skills || <span className="rs-muted">—</span>}</td>
                      <td>{domain || <span className="rs-muted">—</span>}</td>
                      <td>{years !== undefined && years !== null ? `${years} yrs` : <span className="rs-muted">—</span>}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="rs-empty">
                    No results yet. Upload CVs, define criteria, then run ranking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
