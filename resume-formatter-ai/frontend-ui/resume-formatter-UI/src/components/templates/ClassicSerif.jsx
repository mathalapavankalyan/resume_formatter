// src/components/templates/ClassicSerif.jsx
import React from "react";
import "./../resumeTemplates.css";

function hasItems(x) {
  return Array.isArray(x) ? x.length > 0 : !!x;
}

export default function ClassicSerif({ data }) {
  const {
    name="", email="", phone="", links=[],
    summary="", skills=[], skills_grouped={},
    experience=[], education=[], projects=[],
    achievements=[], certifications=[], awards=[],
    publications=[], languages=[], hobbies=[]
  } = data || {};

  return (
    <div className="resume classic-serif">
      <header className="r-head">
        <h1>{name}</h1>
        <p className="muted">{[email, phone, ...(links||[])].filter(Boolean).join(" • ")}</p>
      </header>

      {summary && <section><h2>Summary</h2><p>{summary}</p></section>}

      {(hasItems(skills_grouped.core)||hasItems(skills_grouped.nice)||hasItems(skills_grouped.other)) ? (
        <section>
          <h2>Skills</h2>
          {hasItems(skills_grouped.core) && (<><h3 className="subtle">Core</h3><ul className="chip-list serif-chips">{skills_grouped.core.map((s,i)=><li key={`c-${i}`}>{s}</li>)}</ul></>)}
          {hasItems(skills_grouped.nice) && (<><h3 className="subtle">Nice to Have</h3><ul className="chip-list serif-chips">{skills_grouped.nice.map((s,i)=><li key={`n-${i}`}>{s}</li>)}</ul></>)}
          {hasItems(skills_grouped.other) && (<><h3 className="subtle">Additional</h3><ul className="chip-list serif-chips">{skills_grouped.other.map((s,i)=><li key={`o-${i}`}>{s}</li>)}</ul></>)}
        </section>
      ) : hasItems(skills) && (
        <section><h2>Skills</h2><ul className="chip-list serif-chips">{skills.map((s,i)=><li key={i}>{s}</li>)}</ul></section>
      )}

      {hasItems(experience) && (
        <section>
          <h2>Experience</h2>
          {experience.map((exp,i)=>(
            <div key={i} className="exp">
              <div className="exp-top"><strong>{exp.title}</strong>, {exp.company}<span className="exp-dates muted">{exp.dates}</span></div>
              {hasItems(exp.bullets)&&<ul className="bullets">{exp.bullets.map((b,j)=><li key={j}>{b}</li>)}</ul>}
            </div>
          ))}
        </section>
      )}

      {hasItems(projects)&&(
        <section>
          <h2>Projects</h2>
          {projects.map((p,i)=>(
            <div key={i} className="exp">
              <div className="exp-top"><b>{p.name}</b><span className="exp-dates muted">{p.dates}</span></div>
              {p.description&&<p>{p.description}</p>}
              {hasItems(p.bullets)&&<ul className="bullets">{p.bullets.map((b,j)=><li key={j}>{b}</li>)}</ul>}
            </div>
          ))}
        </section>
      )}

      {hasItems(achievements)&&(<section><h2>Achievements</h2><ul className="bullets">{achievements.map((a,i)=><li key={i}>{a}</li>)}</ul></section>)}
      {hasItems(certifications)&&(<section><h2>Certifications</h2>{certifications.map((c,i)=><p key={i}>{c.name}{c.authority?` — ${c.authority}`:""}{c.date?` (${c.date})`:""}</p>)}</section>)}
      {hasItems(awards)&&(<section><h2>Awards</h2>{awards.map((a,i)=><p key={i}>{a.title||a.name}{a.issuer?` — ${a.issuer}`:""}{a.date?` (${a.date})`:""}</p>)}</section>)}
      {hasItems(publications)&&(<section><h2>Publications</h2>{publications.map((p,i)=><p key={i}><em>{p.title}</em>{p.publisher?` — ${p.publisher}`:""}{p.date?` (${p.date})`:""}</p>)}</section>)}

      {hasItems(education)&&(
        <section>
          <h2>Education</h2>
          {education.map((ed,i)=>(
            <p key={i}><strong>{ed.degree}</strong>, {ed.school}{ed.dates?` — ${ed.dates}`:""}</p>
          ))}
        </section>
      )}

      {(hasItems(languages)||hasItems(hobbies))&&(
        <section><h2>Additional</h2>
          {hasItems(languages)&&<p><b>Languages:</b> {languages.join(" • ")}</p>}
          {hasItems(hobbies)&&<p><b>Interests:</b> {hobbies.join(" • ")}</p>}
        </section>
      )}
    </div>
  );
}
