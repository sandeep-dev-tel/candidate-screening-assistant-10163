import React, { useState } from "react";
import { Card, Button, Input, Textarea } from "../components/Layout";
import { createCriteria, rankCandidates } from "../api/client";

function parseCommaList(value) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// PUBLIC_INTERFACE
export default function CriteriaPage({ onRanked }) {
  /** Page to define criteria for candidate ranking. */
  const [role, setRole] = useState("Software Engineer");
  const [mustHaveSkills, setMustHaveSkills] = useState("JavaScript, React");
  const [niceToHaveSkills, setNiceToHaveSkills] = useState("TypeScript, Node.js");
  const [minYears, setMinYears] = useState("2");
  const [domain, setDomain] = useState("B2B SaaS");
  const [notes, setNotes] = useState("Prefer candidates with recent React experience and clear project ownership.");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [criteriaId, setCriteriaId] = useState("");

  const onRun = async () => {
    setErr("");
    setBusy(true);
    try {
      const criteria = {
        role_title: role,
        must_have_skills: parseCommaList(mustHaveSkills),
        nice_to_have_skills: parseCommaList(niceToHaveSkills),
        min_years_experience: Number(minYears || 0),
        preferred_domain: domain,
        notes
      };

      const created = await createCriteria(criteria);
      const id = created?.id || created?.criteria_id || created?.uuid || "";
      setCriteriaId(id || "");

      const ranked = await rankCandidates(id);
      if (onRanked) onRanked(ranked, id);
    } catch (e) {
      setErr(e.message || "Failed to run ranking.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card
      title="Criteria"
      subtitle="Enter the criteria used to match and rank candidates."
      actions={
        <div className="rs-row">
          <Button variant="primary" onClick={onRun} disabled={busy}>
            {busy ? "Running…" : "Run Ranking"}
          </Button>
        </div>
      }
    >
      {err ? <div className="rs-alert" role="alert">{err}</div> : null}

      <div className="rs-grid2" style={{ marginTop: 12 }}>
        <Input
          label="Role title"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Data Analyst"
        />
        <Input
          label="Preferred domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="e.g., FinTech"
        />
      </div>

      <div className="rs-grid2">
        <Input
          label="Must-have skills (comma-separated)"
          value={mustHaveSkills}
          onChange={(e) => setMustHaveSkills(e.target.value)}
          placeholder="e.g., Python, SQL"
        />
        <Input
          label="Nice-to-have skills (comma-separated)"
          value={niceToHaveSkills}
          onChange={(e) => setNiceToHaveSkills(e.target.value)}
          placeholder="e.g., Spark, AWS"
        />
      </div>

      <Input
        label="Minimum years of experience"
        type="number"
        min="0"
        value={minYears}
        onChange={(e) => setMinYears(e.target.value)}
        hint="Used as a soft filter/boost depending on backend scoring."
      />

      <Textarea
        label="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Any additional preferences or disqualifiers..."
      />

      {criteriaId ? (
        <div className="rs-muted rs-small">
          Latest criteria id: <span className="rs-mono">{criteriaId}</span>
        </div>
      ) : null}
    </Card>
  );
}
