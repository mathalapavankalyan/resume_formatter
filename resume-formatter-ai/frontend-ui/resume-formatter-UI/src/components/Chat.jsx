import React, { useEffect, useRef, useState } from "react";

export default function Chat({ onSend, onFiles }) {
  const [value, setValue] = useState("");        // chat prompt
  const [jdText, setJdText] = useState("");      // JD textarea value
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Upload your Resume above, paste JD below, then tell me how to tailor it (e.g., “Backend Engineer, AWS focus”).",
    },
  ]);
  const listRef = useRef(null);
  const dropRef = useRef(null);
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [resumeChip, setResumeChip] = useState("");

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  function addMessage(m) {
    setMessages((prev) => [...prev, m]);
  }

  // --- File drop (resume only) ---
  useEffect(() => {
    const dz = dropRef.current;
    if (!dz) return;

    const over = (e) => {
      e.preventDefault();
      setDragOver(true);
    };
    const leave = () => setDragOver(false);
    const drop = (e) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files || []);
      if (files.length) {
        const resume = files[0];
        onFiles && onFiles({ resumeFile: resume });
        setResumeChip(`Resume: ${resume.name}`);
      }
    };

    dz.addEventListener("dragover", over);
    dz.addEventListener("dragleave", leave);
    dz.addEventListener("drop", drop);
    return () => {
      dz.removeEventListener("dragover", over);
      dz.removeEventListener("dragleave", leave);
      dz.removeEventListener("drop", drop);
    };
  }, [onFiles]);

  function handleBrowse(e) {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      const resume = files[0];
      onFiles && onFiles({ resumeFile: resume });
      setResumeChip(`Resume: ${resume.name}`);
    }
  }

  async function handleSend() {
    const prompt = value.trim();
    if (!prompt) return;
    addMessage({ role: "user", content: prompt });
    setValue("");
    // Pass JD text along with prompt
    onSend && onSend(prompt, addMessage, jdText);
    inputRef.current?.focus();
  }

  // --- helpers ---
  function renderWithBreaks(text = "") {
    // Show \n as real line breaks inside message bubble
    return text.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));
  }

  function Meter({ value = 0, max = 100, label = "Score" }) {
    const pct = Math.max(0, Math.min(100, (value / (max || 100)) * 100));
    return (
      <div
        className="meter"
        aria-label={label}
        style={{
          marginTop: 8,
          background: "#eef2ff",
          border: "1px solid #dbeafe",
          borderRadius: 8,
          padding: 8,
        }}
      >
        <div
          className="meter-bar"
          style={{
            height: 8,
            borderRadius: 6,
            background:
              "linear-gradient(90deg, rgba(96,165,250,1) 0%, rgba(34,197,94,1) 100%)",
            width: `${pct}%`,
            transition: "width 0.4s ease",
            marginBottom: 6,
          }}
        />
        <div
          className="meter-label"
          style={{ fontSize: 12, color: "#374151" }}
        >
          {label}: {value}/{max}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Resume Dropzone */}
      <div
        ref={dropRef}
        className={`card dropzone ${dragOver ? "dragover" : ""}`}
        aria-label="Upload area"
      >
        <input
          type="file"
          id="fileInput"
          hidden
          accept=".pdf,.doc,.docx,.txt,.md"
          onChange={handleBrowse}
        />
        <div className="dz-topline">
          Drag & drop your <b>Resume</b> here
        </div>
        <div className="dz-subline">or</div>
        <label
          htmlFor="fileInput"
          className="btn btn-outline"
          style={{ display: "inline-block" }}
        >
          Choose file
        </label>
        {resumeChip && (
          <div className="chips">
            <span className="chip">{resumeChip}</span>
          </div>
        )}
      </div>

      {/* JD textarea */}
      <div className="card" style={{ marginTop: "12px", padding: "12px" }}>
        <label
          htmlFor="jdText"
          style={{
            fontSize: "13px",
            fontWeight: 600,
            display: "block",
            marginBottom: "6px",
          }}
        >
          Job Description (paste here)
        </label>
        <textarea
          id="jdText"
          rows={6}
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the Job Description text here..."
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            resize: "vertical",
          }}
        />
      </div>

      {/* Chat */}
      <div className="card chat" aria-live="polite" role="log">
        <div ref={listRef} className="messages">
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              <div className="bubble">
                {/* Support line breaks in assistant tips / ATS breakdown */}
                {typeof m.content === "string" ? renderWithBreaks(m.content) : m.content}

                {/* optional small tip line */}
                {m.meta?.tips && <span className="meta">{m.meta.tips}</span>}

                {/* ATS / any score meter */}
                {m.meta?.meter && (
                  <Meter
                    value={Number(m.meta.meter.value) || 0}
                    max={Number(m.meta.meter.max) || 100}
                    label={m.meta.meter.label || "Score"}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="chat-input">
          <textarea
            ref={inputRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Write a tailoring prompt… (Enter to send, Shift+Enter for newline)"
          />
          <button className="btn" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
