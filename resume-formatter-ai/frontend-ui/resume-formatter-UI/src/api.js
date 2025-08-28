// src/api.js
export async function parseResume({ resumeFile, jdText, prompt }, { timeout = 60000 } = {}) {
  const fd = new FormData();
  if (resumeFile) fd.append("resume", resumeFile);
  if (jdText) fd.append("jd_text", jdText);
  if (prompt) fd.append("prompt", prompt);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new Error("Request timeout")), timeout);

  let res;
  try {
    res = await fetch("/api/parse", { method: "POST", body: fd, signal: ctrl.signal });
  } catch (err) {
    clearTimeout(timer);
    throw new Error(`Network error: ${err.message}`);
  }
  clearTimeout(timer);

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    let msg = `parse failed (${res.status})`;
    try {
      if (contentType.includes("application/json")) {
        const errJson = await res.json();
        msg = errJson.detail || JSON.stringify(errJson) || msg;
      } else {
        const txt = await res.text();
        msg = txt || msg;
      }
    } catch {
      console.log("first")
    }
    throw new Error(msg);
  }

  if (contentType.includes("application/json")) {
    return res.json();
  } else {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Server returned non-JSON response");
    }
  }
}

export const formatResume = parseResume;
