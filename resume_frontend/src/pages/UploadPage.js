import React, { useMemo, useState } from "react";
import { Card, Button } from "../components/Layout";
import { uploadResumes } from "../api/client";

// PUBLIC_INTERFACE
export default function UploadPage({ onUploaded }) {
  /** Page for uploading multiple resume files and triggering parse. */
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);

  const fileNames = useMemo(() => files.map((f) => f.name), [files]);

  const onPick = (e) => {
    setErr("");
    setResult(null);
    const picked = Array.from(e.target.files || []);
    setFiles(picked);
  };

  const onUpload = async () => {
    setErr("");
    setResult(null);

    if (!files.length) {
      setErr("Please select one or more files (PDF/DOC/DOCX) to upload.");
      return;
    }

    setBusy(true);
    try {
      const res = await uploadResumes(files);
      setResult(res);
      if (onUploaded) onUploaded(res);
    } catch (e) {
      setErr(e.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Card
        title="Upload CVs"
        subtitle="Upload multiple PDFs/Word documents. The backend will parse and extract structured info."
        actions={
          <div className="rs-row">
            <Button variant="secondary" onClick={onUpload} disabled={busy}>
              {busy ? "Uploading…" : "Upload & Parse"}
            </Button>
          </div>
        }
      >
        {err ? <div className="rs-alert" role="alert">{err}</div> : null}

        <div className="rs-row" style={{ marginTop: 12 }}>
          <input
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            multiple
            onChange={onPick}
            aria-label="Select resume files"
          />
          <div className="rs-muted rs-small">
            Tip: Upload 5–20 CVs at a time for faster iteration.
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {fileNames.length ? (
            <div className="rs-row" style={{ gap: 8, alignItems: "flex-start" }}>
              {fileNames.slice(0, 12).map((n) => (
                <span key={n} className="rs-pill">{n}</span>
              ))}
              {fileNames.length > 12 ? (
                <span className="rs-muted rs-small">+{fileNames.length - 12} more</span>
              ) : null}
            </div>
          ) : (
            <div className="rs-empty">No files selected yet.</div>
          )}
        </div>
      </Card>

      <Card
        title="Parse Status"
        subtitle="Once uploaded, parsed resumes should appear in the Results tab."
      >
        {result ? (
          <pre
            className="rs-mono rs-small"
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        ) : (
          <div className="rs-empty">No upload run yet.</div>
        )}
      </Card>
    </>
  );
}
