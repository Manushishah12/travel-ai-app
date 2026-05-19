import { useState } from "react";
import { ChevronDown, Building2, Utensils, Bell } from "lucide-react";
import DetailCard from "./DetailCard";
import Stars from "./Stars";

function CompactRow({ icon: Icon, label, sub, rating, onClick, open }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-[#e8e2d9] hover:border-[#d4cdc3] transition-colors text-left"
    >
      <Icon size={18} className="text-[#8a8278] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#2c2824] truncate">{label}</p>
        {sub && <p className="text-xs text-[#8a8278] truncate">{sub}</p>}
      </div>
      {rating != null && (
        <span className="flex items-center gap-1 text-xs text-[#5c564f] shrink-0">
          <Stars rating={rating} size={11} />
          <span>{rating}</span>
        </span>
      )}
      <ChevronDown
        size={18}
        className={`text-[#a39e94] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
  );
}

export default function DayCard({ day, city, defaultOpen = false, showReminder = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [expandedItem, setExpandedItem] = useState(null);

  const dayNum = day.day ?? 1;
  const title = day.title || `Day ${dayNum}`;

  return (
    <div className="rounded-2xl border border-[#e8e2d9] bg-[#f5f0e8]/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[#f5f0e8]/80 transition-colors"
      >
        <div>
          <span className="text-xs font-semibold text-[#5a7fa8] uppercase tracking-wide">
            Day {dayNum}
          </span>
          <h3 className="text-base font-semibold text-[#2c2824] mt-0.5">{title}</h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {showReminder && (
            <span className="text-xs px-2 py-1 rounded-full bg-white border border-[#e0d8cc] text-[#5c564f] flex items-center gap-1">
              <Bell size={12} /> Reminder set
            </span>
          )}
          <ChevronDown
            size={20}
            className={`text-[#a39e94] transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          {day.hotel && (
            <div>
              <CompactRow
                icon={Building2}
                label={`Hotel · ${day.hotel.name}`}
                sub={day.hotel.type || "Check-in 2pm"}
                rating={day.hotel.rating}
                open={expandedItem === "hotel"}
                onClick={() => setExpandedItem(expandedItem === "hotel" ? null : "hotel")}
              />
              {expandedItem === "hotel" && (
                <div className="mt-2 pl-1">
                  <DetailCard item={day.hotel} type="hotel" city={city} defaultOpen />
                </div>
              )}
            </div>
          )}

          {day.food?.map((f, i) => {
            const key = `food-${i}`;
            return (
              <div key={key}>
                <CompactRow
                  icon={Utensils}
                  label={`${f.meal || "Meal"} · ${f.name}`}
                  sub={f.timing || f.category}
                  rating={f.rating}
                  open={expandedItem === key}
                  onClick={() => setExpandedItem(expandedItem === key ? null : key)}
                />
                {expandedItem === key && (
                  <div className="mt-2 pl-1">
                    <DetailCard item={f} type="food" city={city} defaultOpen />
                  </div>
                )}
              </div>
            );
          })}

          {day.places?.map((p, i) => {
            const key = `place-${i}`;
            return (
              <div key={key}>
                <CompactRow
                  icon={Building2}
                  label={p.name}
                  sub={p.timing || p.category}
                  rating={p.rating}
                  open={expandedItem === key}
                  onClick={() => setExpandedItem(expandedItem === key ? null : key)}
                />
                {expandedItem === key && (
                  <div className="mt-2 pl-1">
                    <DetailCard item={p} type="place" city={city} defaultOpen />
                  </div>
                )}
              </div>
            );
          })}

          {day.notes && (
            <p className="text-xs text-[#8a8278] px-2 pt-2">{day.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
