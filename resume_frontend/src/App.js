import React, { useMemo, useState } from "react";
import "./App.css";
import { Layout } from "./components/Layout";
import UploadPage from "./pages/UploadPage";
import CriteriaPage from "./pages/CriteriaPage";
import ResultsPage from "./pages/ResultsPage";
import { getApiBaseUrl } from "./api/client";

// PUBLIC_INTERFACE
function App() {
  /** Resume Screening Assistant frontend app shell (sidebar/topbar + pages). */
  const [active, setActive] = useState("upload");
  const [lastRanked, setLastRanked] = useState(null);

  const apiBase = useMemo(() => getApiBaseUrl(), []);

  const onUploaded = () => {
    // After upload, prompt user to define criteria next.
    setActive("criteria");
  };

  const onRanked = (ranked) => {
    setLastRanked(ranked);
    setActive("results");
  };

  return (
    <div className="App">
      <Layout active={active} onNavigate={setActive}>
        {!apiBase ? (
          <div className="rs-alert" role="alert">
            Backend API base URL is not configured. Set{" "}
            <code>REACT_APP_RESUME_BACKEND_BASE_URL</code> (see <code>.env.example</code>).
          </div>
        ) : null}

        {active === "upload" ? <UploadPage onUploaded={onUploaded} /> : null}
        {active === "criteria" ? <CriteriaPage onRanked={onRanked} /> : null}
        {active === "results" ? <ResultsPage initialRanked={lastRanked} /> : null}
      </Layout>
    </div>
  );
}

export default App;
