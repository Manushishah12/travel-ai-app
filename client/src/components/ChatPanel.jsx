import { useEffect, useRef, useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { chatApi } from "../lib/api";
import ChatMessage from "./ChatMessage";

const PLAN_READY_MSG =
  "✓ All set — generating your plan… Your personalised itinerary is ready in the Trip plan tab!";

export default function ChatPanel({
  sessionId,
  messages,
  setMessages,
  setSessionId,
  setTripPlan,
  onPlanReady,
}) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setError("");
    setSending(true);
    const optimistic = {
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");

    try {
      const data = await chatApi.send(sessionId, trimmed);
      setSessionId(data.session_id);

      const session = await chatApi.getSession(data.session_id);
      let msgs = session.messages || [];

      if (session.trip_plan) {
        setTripPlan(session.trip_plan);
        const hasSuccess = msgs.some((m) => m.content?.includes("Trip plan tab"));
        if (!hasSuccess) {
          msgs = [
            ...msgs,
            {
              role: "model",
              content: PLAN_READY_MSG,
              timestamp: new Date().toISOString(),
              variant: "success",
            },
          ];
        }
        onPlanReady?.(session.title);
      }

      setMessages(msgs);
    } catch (e) {
      setError(e.message);
      setMessages((prev) => prev.filter((m) => m !== optimistic));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#faf8f5]">
      <div className="flex-1 overflow-y-auto px-6 py-8 max-w-3xl mx-auto w-full">
        {!sessionId && messages.length === 0 && (
          <div className="text-center py-16">
            <p className="text-lg font-medium text-[#2c2824]">Welcome to TravelAI</p>
            <p className="text-sm text-[#8a8278] mt-2 max-w-sm mx-auto">
              Click <strong>New trip</strong> in the sidebar to start. We will ask a few questions,
              then build your personalised itinerary.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <ChatMessage
            key={`${m.timestamp}-${i}`}
            message={m}
            variant={m.variant || "default"}
            onQuickReply={sendMessage}
          />
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-[#8a8278] text-sm mb-4">
            <Loader2 size={16} className="animate-spin text-[#5a7fa8]" />
            TravelAI is thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="px-6 py-2 text-sm text-red-700 bg-red-50 border-t border-red-100 max-w-3xl mx-auto w-full">
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="shrink-0 border-t border-[#e8e2d9] bg-white/80 backdrop-blur px-6 py-4"
      >
        <div className="max-w-3xl mx-auto flex gap-3 items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about your trip…"
            disabled={sending}
            className="flex-1 rounded-full border border-[#e0d8cc] bg-white px-5 py-3 text-sm text-slate-800 placeholder:text-[#a39e94] focus:outline-none focus:ring-2 focus:ring-[#5a7fa8]/25 focus:border-[#5a7fa8] disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="shrink-0 w-11 h-11 rounded-full bg-[#3b6ea8] text-white flex items-center justify-center hover:bg-[#2f5a8a] disabled:opacity-50 transition-colors shadow-sm"
            aria-label="Send"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
