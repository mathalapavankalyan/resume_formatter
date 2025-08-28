// src/components/templates/CompactATS.jsx
import React from "react";
import "./../resumeTemplates.css";

function hasItems(x){return Array.isArray(x)?x.length>0:!!x;}

export default function CompactATS({data}){
  const {
    name="",email="",phone="",links=[],
    summary="",skills=[],skills_grouped={},
    experience=[],education=[],projects=[],achievements=[],certifications=[],awards=[],publications=[],languages=[],hobbies=[]
  }=data||{};

  return(
    <div className="resume compact-ats">
      <header className="r-head">
        <h1>{name}</h1>
        <p className="muted">{[email,phone,...(links||[])].filter(Boolean).join(" • ")}</p>
      </header>

      {summary&&<section><h2>Summary</h2><p className="tight">{summary}</p></section>}

      {(hasItems(skills_grouped.core)||hasItems(skills_grouped.nice)||hasItems(skills_grouped.other))?(
        <section><h2>Skills</h2>
          {hasItems(skills_grouped.core)&&<p className="tight"><b>Core:</b> {skills_grouped.core.join(" • ")}</p>}
          {hasItems(skills_grouped.nice)&&<p className="tight"><b>Nice:</b> {skills_grouped.nice.join(" • ")}</p>}
          {hasItems(skills_grouped.other)&&<p className="tight"><b>Other:</b> {skills_grouped.other.join(" • ")}</p>}
        </section>
      ):hasItems(skills)&&<section><h2>Skills</h2><p className="tight">{skills.join(" • ")}</p></section>}

      {hasItems(experience)&&<section><h2>Experience</h2>{experience.map((exp,i)=><div key={i} className="exp tight-row"><div className="exp-head"><span><b>{exp.title}</b>, {exp.company}</span><span className="muted">{exp.dates}</span></div>{hasItems(exp.bullets)&&<ul className="bullets tight">{exp.bullets.map((b,j)=><li key={j}>{b}</li>)}</ul>}</div>)}</section>}

      {hasItems(projects)&&<section><h2>Projects</h2>{projects.map((p,i)=><div key={i}><b>{p.name}</b>{p.dates?` — ${p.dates}`:""}{p.description&&<p>{p.description}</p>}</div>)}</section>}

      {hasItems(achievements)&&<section><h2>Achievements</h2><ul className="bullets tight">{achievements.map((a,i)=><li key={i}>{a}</li>)}</ul></section>}
      {hasItems(certifications)&&<section><h2>Certifications</h2>{certifications.map((c,i)=><p key={i}>{c.name}{c.authority?` — ${c.authority}`:""}{c.date?` (${c.date})`:""}</p>)}</section>}
      {hasItems(awards)&&<section><h2>Awards</h2>{awards.map((a,i)=><p key={i}>{a.title||a.name}{a.issuer?` — ${a.issuer}`:""}{a.date?` (${a.date})`:""}</p>)}</section>}
      {hasItems(publications)&&<section><h2>Publications</h2>{publications.map((p,i)=><p key={i}><em>{p.title}</em>{p.publisher?` — ${p.publisher}`:""}{p.date?` (${p.date})`:""}</p>)}</section>}
      {hasItems(education)&&<section><h2>Education</h2>{education.map((ed,i)=><p key={i} className="tight">{ed.degree}, {ed.school}{ed.dates?` (${ed.dates})`:""}</p>)}</section>}
      {(hasItems(languages)||hasItems(hobbies))&&<section><h2>Additional</h2>{hasItems(languages)&&<p><b>Languages:</b> {languages.join(" • ")}</p>}{hasItems(hobbies)&&<p><b>Interests:</b> {hobbies.join(" • ")}</p>}</section>}
    </div>
  )
}
