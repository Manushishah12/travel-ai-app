import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatPanel from "../components/ChatPanel";
import TripPlanView from "../components/TripPlanView";
import { chatApi } from "../lib/api";

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [sessionTitle, setSessionTitle] = useState("New trip");
  const [messages, setMessages] = useState([]);
  const [tripPlan, setTripPlan] = useState(null);
  const [tab, setTab] = useState("chat");
  const [booting, setBooting] = useState(false);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const data = await chatApi.listSessions();
      setSessions(data.sessions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const startWelcomeChat = async (id) => {
    setBooting(true);
    try {
      const data = await chatApi.welcome(id);
      setSessionId(data.session_id);
      setMessages(data.messages || []);
      setTripPlan(data.trip_plan || null);
    } catch (e) {
      console.error(e);
      setMessages([
        {
          role: "model",
          content:
            "Hi! I'm TravelAI. Where would you like to go? (For example: Rajasthan, Goa, or Kerala)",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setBooting(false);
    }
  };

  const loadSession = async (id) => {
    setSessionId(id);
    try {
      const data = await chatApi.getSession(id);
      setMessages(data.messages || []);
      setTripPlan(data.trip_plan || null);
      setSessionTitle(data.title || "New trip");
      if (data.trip_plan) setTab("plan");
      else setTab("chat");
    } catch (e) {
      console.error(e);
    }
  };

  const handleNewTrip = async () => {
    setBooting(true);
    try {
      const data = await chatApi.newSession();
      setSessionId(data.session_id);
      setMessages([]);
      setTripPlan(null);
      setSessionTitle("New trip");
      setTab("chat");
      await startWelcomeChat(data.session_id);
      await loadSessions();
    } catch (e) {
      console.error(e);
    } finally {
      setBooting(false);
    }
  };

  const handlePlanReady = (title) => {
    if (title) setSessionTitle(title);
    setTab("plan");
    loadSessions();
  };

  const handleExport = () => {
    if (!tripPlan) return;
    const blob = new Blob([JSON.stringify(tripPlan, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `travelai-${tripPlan.destination || "trip"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasPlan = Boolean(tripPlan);

  return (
    <div className="h-screen flex bg-[#faf8f5] overflow-hidden">
      <Sidebar
        sessions={sessions}
        activeSessionId={sessionId}
        onNewTrip={handleNewTrip}
        onSelectSession={loadSession}
        loading={sessionsLoading}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-white border-l border-[#e8e2d9]">
        <header className="shrink-0 border-b border-[#e8e2d9] px-8 bg-white">
          <div className="flex gap-8">
            <button
              type="button"
              onClick={() => setTab("chat")}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                tab === "chat"
                  ? "border-[#3b6ea8] text-[#2c2824]"
                  : "border-transparent text-[#8a8278] hover:text-[#5c564f]"
              }`}
            >
              Chat
            </button>
            <button
              type="button"
              onClick={() => setTab("plan")}
              className={`py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                tab === "plan"
                  ? "border-[#3b6ea8] text-[#2c2824]"
                  : "border-transparent text-[#8a8278] hover:text-[#5c564f]"
              }`}
            >
              Trip plan
              {hasPlan && (
                <span className="text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Ready
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 relative">
          {booting ? (
            <div className="flex items-center justify-center h-full text-[#8a8278] text-sm">
              Starting your trip…
            </div>
          ) : tab === "chat" ? (
            <ChatPanel
              sessionId={sessionId}
              messages={messages}
              setMessages={setMessages}
              setSessionId={setSessionId}
              setTripPlan={setTripPlan}
              onPlanReady={handlePlanReady}
            />
          ) : (
            <TripPlanView plan={tripPlan} onExport={handleExport} />
          )}
        </div>
      </main>
    </div>
  );
}
