// src/components/templates/FaangModern.jsx
import React from "react";
import "./../resumeTemplates.css";

function hasItems(x) {
  return Array.isArray(x) ? x.length > 0 : !!x;
}

export default function FaangModern({ data }) {
  const {
    name = "",
    email = "",
    phone = "",
    links = [],
    summary = "",
    skills = [],
    skills_grouped = {},
    experience = [],
    education = [],
    projects = [],
    achievements = [],
    certifications = [],
    awards = [],
    publications = [],
    languages = [],
    hobbies = [],
  } = data || {};

  return (
    <div className="resume faang-modern">
      <header className="r-head">
        <h1>{name}</h1>
        <p className="muted">
          {[email, phone, ...(links || [])].filter(Boolean).join(" • ")}
        </p>
      </header>

      {summary && (
        <section>
          <h2>Summary</h2>
          <p>{summary}</p>
        </section>
      )}

      {/* --- Skills section using JD grouping --- */}
      {(hasItems(skills_grouped.core) ||
        hasItems(skills_grouped.nice) ||
        hasItems(skills_grouped.other)) ? (
        <section>
          <h2>Skills</h2>

          {hasItems(skills_grouped.core) && (
            <>
              <h3 className="subtle">Core</h3>
              <ul className="chip-list">
                {skills_grouped.core.map((s, i) => (
                  <li key={`c-${i}`}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {hasItems(skills_grouped.nice) && (
            <>
              <h3 className="subtle">Nice to Have</h3>
              <ul className="chip-list">
                {skills_grouped.nice.map((s, i) => (
                  <li key={`n-${i}`}>{s}</li>
                ))}
              </ul>
            </>
          )}

          {hasItems(skills_grouped.other) && (
            <>
              <h3 className="subtle">Additional</h3>
              <ul className="chip-list">
                {skills_grouped.other.map((s, i) => (
                  <li key={`o-${i}`}>{s}</li>
                ))}
              </ul>
            </>
          )}
        </section>
      ) : hasItems(skills) ? (
        <section>
          <h2>Skills</h2>
          <ul className="chip-list">
            {skills.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasItems(experience) && (
        <section>
          <h2>Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} className="exp">
              <div className="exp-top">
                <div className="exp-role">
                  {exp.title} — <b>{exp.company}</b>
                </div>
                <div className="exp-dates muted">{exp.dates}</div>
              </div>
              {(exp.location || exp.team) && (
                <div className="muted exp-loc">
                  {[exp.location, exp.team].filter(Boolean).join(" • ")}
                </div>
              )}

              {hasItems(exp.bullets) && (
                <ul className="bullets">
                  {exp.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}

              {exp.impact && <div className="impact">{exp.impact}</div>}

              {hasItems(exp.tech) && (
                <p className="muted" style={{ marginTop: 4 }}>
                  <b>Tech:</b> {exp.tech.join(" • ")}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {hasItems(projects) && (
        <section>
          <h2>Projects</h2>
          {projects.map((p, i) => (
            <div key={i} className="exp">
              <div className="exp-top">
                <div className="exp-role">
                  <b>{p.name}</b>
                </div>
                <div className="exp-dates muted">{p.dates}</div>
              </div>
              {p.description && <p>{p.description}</p>}
              {hasItems(p.bullets) && (
                <ul className="bullets">
                  {p.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
              {hasItems(p.tech) && (
                <p className="muted" style={{ marginTop: 4 }}>
                  <b>Tech:</b> {p.tech.join(" • ")}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {hasItems(achievements) && (
        <section>
          <h2>Achievements</h2>
          <ul className="bullets">
            {achievements.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>
      )}

      {hasItems(certifications) && (
        <section>
          <h2>Certifications</h2>
          {certifications.map((c, i) => (
            <p key={i}>
              {c.name}
              {c.authority ? ` — ${c.authority}` : ""}
              {c.date ? ` (${c.date})` : ""}
            </p>
          ))}
        </section>
      )}

      {hasItems(awards) && (
        <section>
          <h2>Awards</h2>
          {awards.map((a, i) => (
            <p key={i}>
              {a.title || a.name}
              {a.issuer ? ` — ${a.issuer}` : ""}
              {a.date ? ` (${a.date})` : ""}
            </p>
          ))}
        </section>
      )}

      {hasItems(publications) && (
        <section>
          <h2>Publications</h2>
          {publications.map((p, i) => (
            <p key={i}>
              <em>{p.title}</em>
              {p.publisher ? ` — ${p.publisher}` : ""}
              {p.date ? ` (${p.date})` : ""}
            </p>
          ))}
        </section>
      )}

      {hasItems(education) && (
        <section>
          <h2>Education</h2>
          {education.map((ed, i) => {
            const hasDetailsArray = Array.isArray(ed.details) && ed.details.length > 0;
            const hasDetailsText =
              typeof ed.details === "string" && ed.details.trim().length > 0;
            return (
              <div key={i} className="edu" style={{ marginBottom: 6 }}>
                <div>
                  <b>{ed.school}</b>
                  {ed.location ? ` — ${ed.location}` : ""}
                </div>
                <div className="muted">
                  {ed.degree}
                  {ed.dates ? ` • ${ed.dates}` : ""}
                </div>
                {hasDetailsArray && (
                  <ul className="bullets" style={{ marginTop: 4 }}>
                    {ed.details.map((d, j) => (
                      <li key={j}>{d}</li>
                    ))}
                  </ul>
                )}
                {hasDetailsText && <p style={{ marginTop: 4 }}>{ed.details}</p>}
              </div>
            );
          })}
        </section>
      )}

      {(hasItems(languages) || hasItems(hobbies)) && (
        <section>
          <h2>Additional</h2>
          {hasItems(languages) && (
            <p>
              <b>Languages:</b> {languages.join(" • ")}
            </p>
          )}
          {hasItems(hobbies) && (
            <p>
              <b>Interests:</b> {hobbies.join(" • ")}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
