import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Chatbot = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am your HealthCare AI Assistant. " +
               "Describe your symptoms and I will help you " +
               "find the right doctor. 🏥"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const renderMessageContent = (content) => {
    if (!content) return "";
    
    const lines = content.split('\n');
    return lines.map((line, lineIdx) => {
      // Check if it's the custom fallback header
      if (line.includes("AI Health Assistant (Local Diagnostic Mode)")) {
        return (
          <div key={lineIdx} className="flex items-center gap-2 pb-2 mb-3 border-b border-indigo-100/50">
            <span className="text-xl">🏥</span>
            <span className="text-sm font-bold text-indigo-950 uppercase tracking-wide">
              AI Triage Assistant <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full ml-1.5 font-bold normal-case border border-indigo-200">Local Fallback</span>
            </span>
          </div>
        );
      }

      // Check if it is the Anthropic credit error notice
      if (line.includes("The Anthropic AI service is currently unavailable")) {
        let cleanLine = line.replace(/\*\*/g, "");
        return (
          <div key={lineIdx} className="bg-amber-50/70 backdrop-blur-sm border border-amber-200/50 rounded-2xl p-4 my-3 text-xs text-amber-800 shadow-sm shadow-amber-500/5">
            <div className="flex gap-2.5 items-start">
              <span className="text-base mt-0.5">⚠️</span>
              <div className="flex-1 leading-relaxed">
                <span className="font-semibold text-amber-900 block mb-1">System Status Note:</span>
                {cleanLine}
              </div>
            </div>
          </div>
        );
      }

      // Standard list check
      const isListItem = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      let text = line;
      if (isListItem) {
        text = line.trim().substring(2);
      }
      
      const parts = [];
      let lastIndex = 0;
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      
      while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="font-bold text-slate-900">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      // Render safety disclaimer
      if (line.includes("Disclaimer:")) {
        return (
          <div key={lineIdx} className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-400 italic flex gap-2 items-start bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
            <span className="text-sm mt-0.5">⚠️</span>
            <span className="flex-1 leading-normal">{parts}</span>
          </div>
        );
      }

      if (isListItem) {
        return (
          <div key={lineIdx} className="flex gap-2.5 ml-2 my-2 items-start text-sm leading-relaxed text-slate-700">
            <span className="text-indigo-500 mt-1.5 text-xs font-bold">•</span>
            <span className="flex-1">{parts}</span>
          </div>
        );
      }
      
      return (
        <div key={lineIdx} className={line.trim() === "" ? "h-2" : "my-1.5 text-sm leading-relaxed text-slate-700"}>
          {parts}
        </div>
      );
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const apiBase = (process.env.REACT_APP_API_BASE_URL || "http://localhost:8081/api").replace(/\/$/, "");
      const response = await fetch(
        `${apiBase}/chatbot/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: updatedMessages
          })
        }
      );

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Server error");
      }
      const aiReply = data.reply;

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: aiReply }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I am having trouble: " + err.message
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full backdrop-blur-md bg-white/95 rounded-3xl shadow-2xl border border-white/20 overflow-hidden transition-all duration-300 hover:shadow-indigo-500/10">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 px-6 py-5 flex items-center gap-4 border-b border-white/10">
          <div className="w-11 h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-full
                          flex items-center justify-center text-xl shadow-inner">
            🤖
          </div>
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">
              AI Health Assistant
            </h2>
            <p className="text-indigo-200 text-xs mt-0.5">
              Describe symptoms — get instant guidance
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <span className="text-emerald-300 text-xs font-semibold">Online</span>
          </div>

          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white transition-all duration-200 text-sm border border-white/10 active:scale-95 ml-2"
            title="Close Assistant"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg, index) => (
            <div key={index}
              className={`flex ${msg.role === "user"
                ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-5 py-3.5
                              rounded-2xl text-sm leading-relaxed shadow-sm
                ${msg.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none border border-blue-500/10"
                  : "bg-white text-gray-800 rounded-bl-none border border-slate-100/80"
                }`}>
                {msg.role === "user" ? msg.content : renderMessageContent(msg.content)}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-5 py-3.5 rounded-2xl
                              rounded-bl-none shadow-sm border border-slate-100/80">
                <div className="flex gap-1.5 items-center">
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick symptom buttons */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-100 flex gap-2 flex-wrap">
          {["Headache", "Fever", "Chest pain",
            "Skin rash", "Joint pain"].map(symptom => (
            <button key={symptom}
              onClick={() => setInput(symptom)}
              className="text-xs font-semibold bg-indigo-50/50 text-indigo-600 border border-indigo-100/50 px-3.5 py-1.5 rounded-full hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
              {symptom}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex gap-3 items-center">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms (e.g. fever, headache)..."
            rows={1}
            className="flex-1 border border-slate-200 rounded-2xl px-5 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-700 bg-slate-50/50 placeholder-gray-400"
          />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 active:translate-y-0 disabled:opacity-50 disabled:transform-none disabled:shadow-none">
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Send</span>
                <span className="text-xs">➡️</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;