import { Download, MapPin } from "lucide-react";
import DayCard from "./DayCard";

export default function TripPlanView({ plan, onExport }) {
  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16 bg-[#faf8f5]">
        <MapPin className="w-12 h-12 text-[#d4cdc3] mb-4" />
        <h2 className="text-xl font-semibold text-[#2c2824]">No trip plan yet</h2>
        <p className="text-[#8a8278] mt-2 max-w-md text-sm">
          Answer the chat questions about destination, days, interests, budget, and travel group.
          Your day-by-day plan will appear here automatically.
        </p>
      </div>
    );
  }

  const city = plan.destination || "";
  const days = plan.days || [];
  const visibleDays = days.slice(0, 3);
  const hiddenCount = Math.max(0, days.length - 3);

  return (
    <div className="h-full overflow-y-auto bg-[#faf8f5]">
      <header className="sticky top-0 z-10 bg-[#faf8f5]/95 backdrop-blur border-b border-[#e8e2d9] px-6 py-5">
        <div className="max-w-2xl mx-auto flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#2c2824] tracking-tight">
              {plan.destination}
              {plan.duration && (
                <span className="text-[#8a8278] font-normal"> · {plan.duration}</span>
              )}
            </h1>
            {plan.travel_style && (
              <p className="text-sm text-[#8a8278] mt-1">{plan.travel_style}</p>
            )}
            {plan.summary && (
              <p className="text-sm text-[#5c564f] mt-2 max-w-xl">{plan.summary}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onExport}
            className="shrink-0 flex items-center gap-2 text-sm font-medium text-[#5c564f] px-4 py-2 rounded-xl border border-[#e0d8cc] bg-white hover:bg-[#f5f0e8] transition-colors"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-3">
        {visibleDays.map((day, i) => (
          <DayCard
            key={day.day ?? i}
            day={day}
            city={city}
            defaultOpen={i === 0}
            showReminder={i === 2}
          />
        ))}

        {hiddenCount > 0 && (
          <button
            type="button"
            className="w-full py-3 text-sm font-medium text-[#5a7fa8] hover:underline"
          >
            Show all {days.length} days
          </button>
        )}

        {(plan.packing_tips?.length > 0 || plan.best_time_to_visit) && (
          <div className="mt-6 p-4 rounded-2xl bg-white border border-[#e8e2d9] text-sm text-[#5c564f]">
            {plan.best_time_to_visit && (
              <p className="mb-2">
                <span className="font-medium text-[#2c2824]">Best time:</span>{" "}
                {plan.best_time_to_visit}
              </p>
            )}
            {plan.packing_tips?.length > 0 && (
              <ul className="list-disc pl-5 space-y-1">
                {plan.packing_tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
