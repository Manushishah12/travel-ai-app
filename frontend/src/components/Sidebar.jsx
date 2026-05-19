import { Map, Plus, Settings, LogOut } from "lucide-react";
import { formatSessionDate } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Sidebar({
  sessions,
  activeSessionId,
  onNewTrip,
  onSelectSession,
  loading,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-[260px] shrink-0 border-r border-[#e8e2d9] bg-[#f3efe8] flex flex-col h-full">
      <div className="p-5">
        <div className="flex items-center gap-2.5 text-[#2c2824] font-semibold text-lg tracking-tight">
          <Map className="text-[#5a7fa8]" size={22} strokeWidth={2} />
          TravelAI
        </div>
        <button
          type="button"
          onClick={onNewTrip}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-white hover:bg-[#faf8f5] text-[#3d3832] font-medium py-2.5 px-4 rounded-xl border border-[#e0d8cc] shadow-sm transition-colors"
        >
          <Plus size={18} /> New trip
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <p className="text-[11px] font-semibold text-[#a39e94] uppercase tracking-widest px-3 mb-2">
          Recent trips
        </p>
        {loading && <p className="text-sm text-[#8a8278] px-3">Loading…</p>}
        {!loading && sessions.length === 0 && (
          <p className="text-sm text-[#8a8278] px-3">No trips yet</p>
        )}
        <ul className="space-y-0.5">
          {sessions.map((s) => {
            const active = activeSessionId === s.session_id;
            return (
              <li key={s.session_id}>
                <button
                  type="button"
                  onClick={() => onSelectSession(s.session_id)}
                  className={`w-full text-left px-3 py-3 rounded-xl text-sm transition-colors ${
                    active
                      ? "bg-[#ebe4d8] text-[#2c2824] font-medium"
                      : "text-[#5c564f] hover:bg-[#ebe4d8]/60"
                  }`}
                >
                  <span className="block truncate leading-snug">{s.title}</span>
                  <span className="text-xs text-[#a39e94] mt-1 block">
                    {formatSessionDate(s.created_at) || "Recent"}
                    {s.has_plan && (
                      <span className="text-emerald-700 font-medium"> · plan ready</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-3 border-t border-[#e8e2d9]">
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#5c564f] hover:bg-[#ebe4d8]/50 rounded-lg"
        >
          <Settings size={16} /> Settings
        </button>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#5c564f] hover:bg-[#ebe4d8]/50 rounded-lg"
        >
          <LogOut size={16} /> Log out
        </button>
        <p className="text-[10px] text-[#a39e94] px-3 mt-2 truncate">{user?.email}</p>
      </div>
    </aside>
  );
}
