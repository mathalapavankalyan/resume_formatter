// src/components/templates/MinimalGrid.jsx
import React from "react";
import "./../resumeTemplates.css";

function hasItems(x){return Array.isArray(x)?x.length>0:!!x;}

export default function MinimalGrid({data}){
  const {
    name="",email="",phone="",links=[],
    summary="",skills=[],skills_grouped={},
    experience=[],education=[],projects=[],achievements=[],certifications=[],awards=[],publications=[],languages=[],hobbies=[]
  }=data||{};

  return(
    <div className="resume minimal-grid">
      <header className="grid-head">
        <div><h1>{name}</h1>{summary&&<p className="muted">{summary}</p>}</div>
        <div className="right muted"><div>{email}</div><div>{phone}</div>{hasItems(links)&&<div>{links.join(" • ")}</div>}</div>
      </header>

      {(hasItems(skills_grouped.core)||hasItems(skills_grouped.nice)||hasItems(skills_grouped.other))?(
        <section><h2>Skills</h2>
          {hasItems(skills_grouped.core)&&<div><b>Core:</b> {skills_grouped.core.join(" • ")}</div>}
          {hasItems(skills_grouped.nice)&&<div><b>Nice:</b> {skills_grouped.nice.join(" • ")}</div>}
          {hasItems(skills_grouped.other)&&<div><b>Other:</b> {skills_grouped.other.join(" • ")}</div>}
        </section>
      ):hasItems(skills)&&<section><h2>Skills</h2><ul className="chip-list">{skills.map((s,i)=><li key={i}>{s}</li>)}</ul></section>}

      {hasItems(experience)&&<section><h2>Experience</h2>{experience.map((exp,i)=><div key={i} className="exp"><div className="exp-top"><div className="exp-role"><b>{exp.title}</b> — {exp.company}</div><div className="exp-dates muted">{exp.dates}</div></div>{hasItems(exp.bullets)&&<ul className="bullets">{exp.bullets.map((b,j)=><li key={j}>{b}</li>)}</ul>}</div>)}</section>}
      {hasItems(projects)&&<section><h2>Projects</h2>{projects.map((p,i)=><div key={i}><b>{p.name}</b>{p.dates?` — ${p.dates}`:""}{p.description&&<p>{p.description}</p>}</div>)}</section>}
      {hasItems(achievements)&&<section><h2>Achievements</h2><ul className="bullets">{achievements.map((a,i)=><li key={i}>{a}</li>)}</ul></section>}
      {hasItems(certifications)&&<section><h2>Certifications</h2>{certifications.map((c,i)=><p key={i}>{c.name}{c.authority?` — ${c.authority}`:""}{c.date?` (${c.date})`:""}</p>)}</section>}
      {hasItems(awards)&&<section><h2>Awards</h2>{awards.map((a,i)=><p key={i}>{a.title||a.name}{a.issuer?` — ${a.issuer}`:""}{a.date?` (${a.date})`:""}</p>)}</section>}
      {hasItems(publications)&&<section><h2>Publications</h2>{publications.map((p,i)=><p key={i}><em>{p.title}</em>{p.publisher?` — ${p.publisher}`:""}{p.date?` (${p.date})`:""}</p>)}</section>}
      {hasItems(education)&&<section><h2>Education</h2>{education.map((ed,i)=><p key={i}><b>{ed.school}</b>, {ed.degree}{ed.dates?` • ${ed.dates}`:""}</p>)}</section>}
      {(hasItems(languages)||hasItems(hobbies))&&<section><h2>Additional</h2>{hasItems(languages)&&<p><b>Languages:</b> {languages.join(" • ")}</p>}{hasItems(hobbies)&&<p><b>Interests:</b> {hobbies.join(" • ")}</p>}</section>}
    </div>
  )
}
