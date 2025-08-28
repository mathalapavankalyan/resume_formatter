// src/components/ResumePage.jsx
import React, { forwardRef } from "react";
import "./resumeTemplates.css";

const ResumePage = forwardRef(function ResumePage({ children }, ref) {
  return (
    <div className="a4-preview">
      <div ref={ref} className="a4-page">
        {children}
      </div>
    </div>
  );
});

export default ResumePage;
