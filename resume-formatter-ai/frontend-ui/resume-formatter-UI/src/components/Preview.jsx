// src/components/Preview.jsx
import React, { forwardRef } from "react";
import ResumePage from "./ResumePage.jsx";
import FaangModern from "./templates/FaangModern.jsx";
import ClassicSerif from "./templates/ClassicSerif.jsx";
import CompactATS from "./templates/CompactATS.jsx";
import MinimalGrid from "./templates/MinimalGrid.jsx";

const Preview = forwardRef(function Preview({ data, template }, ref) {
  const T = {
    FAANG: FaangModern,
    Serif: ClassicSerif,
    Compact: CompactATS,
    Modern: MinimalGrid,
  }[template] || FaangModern;

  return (
    <ResumePage ref={ref}>
      <T data={data} />
    </ResumePage>
  );
});

export default Preview;
