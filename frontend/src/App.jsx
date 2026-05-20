import { useState } from "react";
import axios from "axios";

const LANGUAGES = [
  "Tamil", "Hindi", "Telugu", "Kannada", "Malayalam",
  "French", "Spanish", "German", "Japanese", "Arabic"
];

export default function App() {
  const [input, setInput] = useState("");
  const [targetLang, setTargetLang] = useState("Tamil");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("translate");

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");

    const prompt = mode === "translate"
      ? `Translate the following text to ${targetLang}. Return only the translated text:\n\n${input}`
      : `Write a professional version of the following content in ${targetLang}:\n\n${input}`;

    try {
      const res = await axios.post("http://127.0.0.1:8000/agent/query", {
        query: prompt
      });
      setOutput(res.data.response);
    } catch {
      setOutput("Error connecting to backend.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0d14",
      color: "#e2e8f0", fontFamily: "Segoe UI, sans-serif",
      display: "flex", flexDirection: "column"
    }}>
      {/* Header */}
      <div style={{
        background: "#0f1623", borderBottom: "1px solid #1e2940",
        padding: "16px 32px", display: "flex",
        alignItems: "center", gap: "12px"
      }}>
        <div style={{
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          borderRadius: "10px", padding: "8px",
          fontSize: "20px"
        }}>🌐</div>
        <div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#fff" }}>
            Multilingual AI Writer
          </div>
          <div style={{ fontSize: "12px", color: "#4a6080" }}>
            Powered by Groq LLaMA · 100+ Languages
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{
        flex: 1, padding: "32px",
        maxWidth: "1100px", width: "100%", margin: "0 auto"
      }}>

        {/* Mode Toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["translate", "write"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              padding: "8px 20px", borderRadius: "20px",
              border: mode === m ? "none" : "1px solid #1e2940",
              background: mode === m
                ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                : "#0f1623",
              color: "#fff", cursor: "pointer",
              fontSize: "13px", fontWeight: 600
            }}>
              {m === "translate" ? "🔄 Translate" : "✍️ AI Write"}
            </button>
          ))}
        </div>

        {/* Editor Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* Input */}
          <div>
            <div style={{
              fontSize: "12px", color: "#6366f1",
              marginBottom: "8px", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.8px"
            }}>
              Source Content
            </div>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type or paste your content here..."
              style={{
                width: "100%", height: "280px",
                background: "#0f1623", border: "1px solid #1e2940",
                borderRadius: "12px", padding: "16px",
                color: "#e2e8f0", fontSize: "14px",
                lineHeight: "1.7", resize: "none",
                outline: "none", fontFamily: "inherit"
              }}
            />
            <div style={{
              fontSize: "12px", color: "#2a3a52",
              marginTop: "6px", textAlign: "right"
            }}>
              {input.length} characters
            </div>
          </div>

          {/* Output */}
          <div>
            <div style={{
              fontSize: "12px", color: "#22c55e",
              marginBottom: "8px", fontWeight: 600,
              textTransform: "uppercase", letterSpacing: "0.8px"
            }}>
              {mode === "translate" ? `Translated — ${targetLang}` : `AI Written — ${targetLang}`}
            </div>
            <div style={{
              width: "100%", height: "280px",
              background: "#0f1623", border: "1px solid #1e2940",
              borderRadius: "12px", padding: "16px",
              color: output ? "#e2e8f0" : "#2a3a52",
              fontSize: "14px", lineHeight: "1.7",
              overflowY: "auto", boxSizing: "border-box"
            }}>
              {loading ? (
                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "8px" }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: "8px", height: "8px",
                      background: "#6366f1", borderRadius: "50%",
                      animation: `bounce 1.2s ${i*0.2}s infinite`
                    }} />
                  ))}
                </div>
              ) : output || "Your output will appear here..."}
            </div>
            {output && (
              <button onClick={() => navigator.clipboard.writeText(output)} style={{
                marginTop: "8px", background: "transparent",
                border: "1px solid #1e2940", borderRadius: "8px",
                color: "#4a6080", padding: "6px 14px",
                fontSize: "12px", cursor: "pointer"
              }}>
                📋 Copy
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{
          display: "flex", gap: "16px",
          alignItems: "center", marginTop: "24px"
        }}>
          <div>
            <div style={{ fontSize: "12px", color: "#4a6080", marginBottom: "6px" }}>
              Target Language
            </div>
            <select
              value={targetLang}
              onChange={e => setTargetLang(e.target.value)}
              style={{
                background: "#0f1623", border: "1px solid #1e2940",
                borderRadius: "8px", padding: "10px 16px",
                color: "#e2e8f0", fontSize: "14px",
                outline: "none", cursor: "pointer"
              }}
            >
              {LANGUAGES.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <button onClick={handleGenerate} disabled={loading || !input.trim()} style={{
            marginTop: "18px",
            background: loading
              ? "#1e2940"
              : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none", borderRadius: "10px",
            padding: "11px 32px", color: "#fff",
            fontSize: "14px", fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s"
          }}>
            {loading ? "Processing..." : mode === "translate" ? "🔄 Translate" : "✍️ Generate"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}