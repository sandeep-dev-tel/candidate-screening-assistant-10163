import React from "react";
import "./layout.css";

/**
 * App layout with sidebar + topbar + main content.
 */

// PUBLIC_INTERFACE
export function Layout({ active, onNavigate, children }) {
  /** Main app layout component. */
  return (
    <div className="rs-app">
      <aside className="rs-sidebar" aria-label="Primary navigation">
        <div className="rs-brand">
          <div className="rs-brandMark" aria-hidden="true" />
          <div>
            <div className="rs-brandTitle">Resume Screening</div>
            <div className="rs-brandSub">Assistant</div>
          </div>
        </div>

        <nav className="rs-nav">
          <button
            className={`rs-navItem ${active === "upload" ? "isActive" : ""}`}
            onClick={() => onNavigate("upload")}
          >
            Upload CVs
          </button>
          <button
            className={`rs-navItem ${active === "criteria" ? "isActive" : ""}`}
            onClick={() => onNavigate("criteria")}
          >
            Criteria
          </button>
          <button
            className={`rs-navItem ${active === "results" ? "isActive" : ""}`}
            onClick={() => onNavigate("results")}
          >
            Results
          </button>
        </nav>

        <div className="rs-sidebarFoot">
          <div className="rs-muted">
            Configure API in <code>.env</code>:
          </div>
          <div className="rs-mono rs-small">REACT_APP_RESUME_BACKEND_BASE_URL</div>
        </div>
      </aside>

      <div className="rs-main">
        <header className="rs-topbar">
          <div className="rs-topbarTitle">
            {active === "upload" && "Upload & Parse"}
            {active === "criteria" && "Define Matching Criteria"}
            {active === "results" && "Ranked Candidates"}
          </div>
          <div className="rs-topbarRight" />
        </header>

        <main className="rs-content">{children}</main>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function Card({ title, subtitle, children, actions }) {
  /** Simple card container component. */
  return (
    <section className="rs-card">
      <header className="rs-cardHead">
        <div>
          <div className="rs-cardTitle">{title}</div>
          {subtitle ? <div className="rs-cardSub">{subtitle}</div> : null}
        </div>
        {actions ? <div className="rs-cardActions">{actions}</div> : null}
      </header>
      <div className="rs-cardBody">{children}</div>
    </section>
  );
}

// PUBLIC_INTERFACE
export function Button({ variant = "primary", size = "md", ...props }) {
  /** Button with variants: primary | secondary | ghost | danger. */
  const cls = ["rs-btn", `rs-btn--${variant}`, `rs-btn--${size}`, props.className]
    .filter(Boolean)
    .join(" ");
  return <button {...props} className={cls} />;
}

// PUBLIC_INTERFACE
export function Input({ label, hint, ...props }) {
  /** Labeled input field. */
  return (
    <label className="rs-field">
      <div className="rs-fieldLabel">{label}</div>
      <input className="rs-input" {...props} />
      {hint ? <div className="rs-fieldHint">{hint}</div> : null}
    </label>
  );
}

// PUBLIC_INTERFACE
export function Textarea({ label, hint, ...props }) {
  /** Labeled textarea field. */
  return (
    <label className="rs-field">
      <div className="rs-fieldLabel">{label}</div>
      <textarea className="rs-textarea" {...props} />
      {hint ? <div className="rs-fieldHint">{hint}</div> : null}
    </label>
  );
}
