// src/components/TemplateSwitcher.jsx
import React from "react";

export default function TemplateSwitcher({ value, onChange }) {
  const options = ["FAANG", "Serif", "Compact", "Modern"];
  return (
    <div className="card switcher">
      <div className="switcher-title">Template</div>
      <div className="switcher-buttons">
        {options.map((o) => (
          <button
            key={o}
            className={`btn-pill ${value === o ? "active" : ""}`}
            onClick={() => onChange(o)}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
