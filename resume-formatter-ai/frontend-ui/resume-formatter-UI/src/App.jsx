// src/App.jsx
import React, { useRef, useState } from "react";
import Chat from "./components/Chat.jsx";
import Preview from "./components/Preview.jsx";
import TemplateSwitcher from "./components/TemplateSwitcher.jsx";
import { parseResume } from "./api.js";
import { useReactToPrint } from "react-to-print";

export default function App() {
  const [template, setTemplate] = useState("FAANG");
  const [files, setFiles] = useState({ resumeFile: null });
  const [loading, setLoading] = useState(false);
  const [resumeData, setResumeData] = useState(null);

  const printRef = useRef(null);
  const handleDownload = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${resumeData?.name || "Resume"}`
  });

  function handleFiles({ resumeFile }) {
    setFiles((prev) => ({ ...prev, resumeFile: resumeFile ?? prev.resumeFile }));
  }

  async function handleSend(prompt, addMessage, jdText) {
    if (!files.resumeFile) {
      return addMessage({ role: "assistant", content: "Please upload a Resume file to proceed." });
    }
    if (!jdText || !jdText.trim()) {
      return addMessage({ role: "assistant", content: "Please paste the Job Description." });
    }

    setLoading(true);
    addMessage({ role: "assistant", content: "Parsing & tailoring…", meta: { tips: "Switch templates on the right." } });

    try {
      const json = await parseResume({ resumeFile: files.resumeFile, jdText, prompt });
      const merged = normalizeData(json);
      setResumeData(merged);

      addMessage({ role: "assistant", content: "Done! Preview updated on the right." });

      if (json.meta?.ats_score !== undefined) {
        const score = json.meta.ats_score;
        addMessage({
          role: "assistant",
          content: ` ATS Match Score: ${score}%`,
          meta: { meter: { value: score, max: 100, label: "ATS Match" } }
        });

        const reqMissing = json.meta?.ats?.required?.missing || [];
        const niceMissing = json.meta?.ats?.nice?.missing || [];
        const missingLines = [];
        if (reqMissing.length) missingLines.push(`Missing (Core): ${reqMissing.join(", ")}`);
        if (niceMissing.length) missingLines.push(`Missing (Nice): ${niceMissing.join(", ")}`);
        if (missingLines.length) {
          addMessage({ role: "assistant", content: missingLines.join("\n") });
        }
      }
    } catch (e) {
      addMessage({ role: "assistant", content: `Error: ${e.message}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <header className="app-header">
        <div className="container header-inner">
          <div className="brand"><span className="brand-dot" /><h1>Resume Tailor</h1></div>
          <div>
            <button className="btn btn-outline" onClick={handleDownload} disabled={!resumeData}>
              Download
            </button>
          </div>
        </div>
      </header>

      <main className="container layout">
        <section className="pane pane-left">
          <Chat onSend={handleSend} onFiles={handleFiles} />
        </section>

        <aside className="pane pane-right">
          <TemplateSwitcher value={template} onChange={setTemplate} />
          <div className="card preview" style={{ padding: 0 }}>
            {resumeData
              ? <Preview ref={printRef} data={resumeData} template={template} />
              : <div style={{ padding: 18 }} className="empty-preview">No preview yet. Generate to see it here.</div>}
          </div>
        </aside>
      </main>

      <div className={`toast ${loading ? "show" : ""}`} role="status" aria-live="polite">Generating…</div>
      <footer className="footer">build by Pavankalyan Mathala</footer>
    </div>
  );
}

function normalizeData(json) {
  const r = json?.resume || {};
  const j = json?.job || {};

  const aliasMap = {
    "react.js": "ReactJS",
    "react": "ReactJS",
    "html": "HTML",
    "css": "CSS",
    "html/css": "HTML/CSS",
    "oop": "Object-Oriented Programming",
    "o.o.p": "Object-Oriented Programming",
    "dsa": "Data Structures and Algorithms",
    "ds&a": "Data Structures and Algorithms",
    "hibernate jpa": "Hibernate/JPA",
    "jpa": "JPA",
    "spring boot": "Spring Boot",
    "javascript": "JavaScript",
  };
  const canon = (s = "") => s.toLowerCase().replace(/\s+/g, " ").trim();
  const label = (s = "") => {
    const c = canon(s.replace(/[._]/g, (m) => (m === "." ? "" : " ")));
    if (aliasMap[c]) return aliasMap[c];
    if (c === "reactjs") return "ReactJS";
    if (c === "hibernate") return "Hibernate";
    return s;
  };
  const uniqPushByLabel = (arr, item) => {
    const L = label(item);
    if (!arr.some((x) => label(x) === L)) arr.push(L);
  };

  const resumeSkills = (Array.isArray(r.skills) ? r.skills : []).map(label);
  const jdReq = (Array.isArray(j.skills_required) ? j.skills_required : []).map(label);
  const jdNice = (Array.isArray(j.nice_to_have) ? j.nice_to_have : []).map(label);

  const core = [];
  jdReq.forEach((s) => uniqPushByLabel(core, s));

  const nice = [];
  jdNice.forEach((s) => uniqPushByLabel(nice, s));

  const other = [];
  resumeSkills.forEach((s) => {
    if (!core.includes(s) && !nice.includes(s)) uniqPushByLabel(other, s);
  });

  const mergedSkills = [...core, ...nice, ...other];

  const mergeList = (a = [], b = [], key) => {
    const out = [];
    const seen = new Set();
    const add = (item) => {
      const k = key ? (item?.[key] || JSON.stringify(item)) : JSON.stringify(item);
      if (!seen.has(k)) { seen.add(k); out.push(item); }
    };
    (a || []).forEach(add);
    (b || []).forEach(add);
    return out;
  };

  const projects = mergeList(r.projects || [], j.projects || [], "name");
  const achievements = mergeList(r.achievements || [], j.achievements || []);
  const languages   = mergeList(r.languages   || [], j.languages   || []);
  const hobbies     = mergeList(r.hobbies     || [], j.hobbies     || []);
  const certifications = mergeList(r.certifications || [], j.certifications || [], "name");
  const awards         = mergeList(r.awards         || [], j.awards         || [], "title");
  const publications   = mergeList(r.publications   || [], j.publications   || [], "title");

  return {
    name:  r.name  || "Your Name",
    email: r.email || "",
    phone: r.phone || "",
    links: r.links || r.profiles || [],
    jobTitle:   j.title   || "",
    jobCompany: j.company || "",
    summary: r.summary || r.objective || "",
    skills: mergedSkills,
    skills_grouped: { core, nice, other },
    experience: Array.isArray(r.experience) ? r.experience : [],
    education:  Array.isArray(r.education)  ? r.education  : [],
    projects,
    achievements,
    certifications,
    awards,
    publications,
    languages,
    hobbies,
  };
}
