import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Send, Package, Loader2, Bot, User, Zap } from "lucide-react";

const SUGGESTIONS = [
  "Shipment is in FAILED status, what should I do?",
  "Customer was unavailable, explain NDR workflow",
  "Shipment has breached SLA, what actions to trigger?",
  "Delay due to hub congestion, what is the RCA?",
  "How does reverse logistics work?",
];

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm your Logistics AI Agent powered by LangChain + Groq. I can help with shipment status, NDR workflows, SLA breaches, delay RCA, and reverse logistics. How can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendQuery = async (query) => {
    if (!query.trim() || loading) return;
    const userMsg = { role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/agent/query", {
        query,
      });
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: res.data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ Could not connect to backend. Make sure FastAPI server is running.",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif" }} className="app">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0d14; color: #e2e8f0; }

        .app { display: flex; flex-direction: column; height: 100vh; }

        .header {
          background: #0f1623;
          border-bottom: 1px solid #1e2940;
          padding: 14px 28px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .header-icon {
          background: linear-gradient(135deg, #1e3a5f, #2563eb);
          border-radius: 10px;
          padding: 8px;
          display: flex;
        }
        .header-title { font-size: 17px; font-weight: 700; color: #fff; }
        .header-sub { font-size: 12px; color: #4a6080; margin-top: 1px; }
        .online-dot {
          width: 8px; height: 8px; background: #22c55e;
          border-radius: 50%; margin-left: auto;
          box-shadow: 0 0 8px #22c55e;
        }

        .chat {
          flex: 1; overflow-y: auto; padding: 24px;
          display: flex; flex-direction: column; gap: 20px;
          max-width: 820px; width: 100%; margin: 0 auto;
        }

        .msg { display: flex; gap: 12px; animation: fadeUp 0.3s ease; }
        .msg.user { flex-direction: row-reverse; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .avatar {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .avatar.ai { background: linear-gradient(135deg, #1e3a5f, #2563eb); }
        .avatar.user { background: linear-gradient(135deg, #2d1b69, #7c3aed); }

        .bubble {
          background: #0f1623;
          border: 1px solid #1e2940;
          border-radius: 14px;
          padding: 12px 16px;
          max-width: 680px;
          font-size: 14px;
          line-height: 1.7;
          color: #cbd5e1;
        }
        .msg.user .bubble {
          background: #13203a;
          border-color: #1e3a5f;
          color: #e2e8f0;
        }
        .bubble-label {
          font-size: 10px; color: #3b6ea5;
          text-transform: uppercase; letter-spacing: 0.8px;
          margin-bottom: 5px; font-weight: 600;
        }

        .typing { display: flex; gap: 5px; align-items: center; padding: 4px 0; }
        .typing span {
          width: 7px; height: 7px; background: #2563eb;
          border-radius: 50%; animation: bounce 1.2s infinite;
        }
        .typing span:nth-child(2) { animation-delay: 0.2s; }
        .typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%,60%,100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }

        .suggestions {
          display: flex; flex-wrap: wrap; gap: 8px;
          padding: 0 24px 12px;
          max-width: 820px; width: 100%; margin: 0 auto;
        }
        .chip {
          background: #0f1623; border: 1px solid #1e2940;
          border-radius: 20px; padding: 6px 14px;
          font-size: 12px; color: #64748b;
          cursor: pointer; transition: all 0.2s;
        }
        .chip:hover { border-color: #2563eb; color: #2563eb; background: #0d1829; }

        .input-area {
          padding: 12px 24px 20px;
          max-width: 820px; width: 100%; margin: 0 auto;
        }
        .input-box {
          display: flex; gap: 10px; align-items: flex-end;
          background: #0f1623; border: 1px solid #1e2940;
          border-radius: 14px; padding: 12px 14px;
          transition: border-color 0.2s;
        }
        .input-box:focus-within { border-color: #2563eb; }

        textarea {
          flex: 1; background: transparent; border: none;
          outline: none; color: #e2e8f0; font-size: 14px;
          resize: none; font-family: inherit;
          max-height: 120px; line-height: 1.6;
        }
        textarea::placeholder { color: #2a3a52; }

        .send-btn {
          background: #2563eb; border: none; border-radius: 10px;
          width: 38px; height: 38px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.2s; flex-shrink: 0;
        }
        .send-btn:hover { background: #1d4ed8; }
        .send-btn:disabled { background: #1e2940; cursor: not-allowed; }

        .powered {
          text-align: center; font-size: 11px; color: #1e2940;
          padding-bottom: 8px;
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <div className="header-icon">
          <Package size={20} color="#60a5fa" />
        </div>
        <div>
          <div className="header-title">Logistics AI Agent</div>
          <div className="header-sub">LangChain · FAISS · Groq LLaMA · FastAPI</div>
        </div>
        <div className="online-dot" />
      </div>

      {/* Chat */}
      <div className="chat">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <div className={`avatar ${m.role}`}>
              {m.role === "ai" ? <Bot size={18} color="#60a5fa" /> : <User size={18} color="#a78bfa" />}
            </div>
            <div className="bubble">
              <div className="bubble-label">{m.role === "ai" ? "AI Agent" : "You"}</div>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="msg">
            <div className="avatar ai">
              <Bot size={18} color="#60a5fa" />
            </div>
            <div className="bubble">
              <div className="bubble-label">AI Agent</div>
              <div className="typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="suggestions">
        {SUGGESTIONS.map((s, i) => (
          <div key={i} className="chip" onClick={() => sendQuery(s)}>
            {s}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="input-area">
        <div className="input-box">
          <textarea
            rows={1}
            placeholder="Ask about shipments, NDR, SLA, delays..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendQuery(input);
              }
            }}
          />
          <button className="send-btn" onClick={() => sendQuery(input)} disabled={loading}>
            {loading ? <Loader2 size={16} color="white" className="spin" /> : <Send size={16} color="white" />}
          </button>
        </div>
      </div>
      <div className="powered">Built with LangChain · FAISS · Groq · FastAPI · React</div>
    </div>
  );
}