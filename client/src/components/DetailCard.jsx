import { useState } from "react";
import { ChevronDown, MapPin, Clock, ExternalLink } from "lucide-react";
import Stars from "./Stars";
import { mockReviewCount, placeImageUrl } from "../lib/utils";

export default function DetailCard({ item, type = "place", city = "", defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const name = item.name || "Unknown";
  const rating = item.rating ?? 4.5;
  const reviews = mockReviewCount(rating);
  const img = placeImageUrl(name, city, item.category || type);

  const subtitle =
    type === "hotel"
      ? item.type || item.price_range
      : type === "food"
        ? [item.meal, item.category].filter(Boolean).join(" · ")
        : [item.category, item.timing].filter(Boolean).join(" · ");

  if (defaultOpen) {
    return (
      <div className="rounded-xl border border-[#e8e2d9] bg-white overflow-hidden">
        <img
          src={img}
          alt={name}
          className="w-full h-36 object-cover bg-[#f3efe8]"
          onError={(e) => {
            e.target.src = `https://picsum.photos/seed/${encodeURIComponent(name)}/640/360`;
          }}
        />
        <div className="p-4 space-y-2 text-sm text-[#5c564f]">
          {item.description && <p>{item.description}</p>}
          {item.must_try && (
            <p>
              <span className="font-medium text-[#2c2824]">Must try:</span> {item.must_try}
            </p>
          )}
          <div className="flex items-center gap-2 pt-2 border-t border-[#f0ebe3]">
            <Stars rating={rating} />
            <span className="text-xs">{reviews} reviews</span>
          </div>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + city)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[#3b6ea8] hover:underline text-xs"
          >
            Open in Maps <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#e8e2d9] bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#faf8f5] transition-colors"
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium text-[#2c2824] truncate">{name}</p>
          {subtitle && <p className="text-sm text-[#8a8278] truncate">{subtitle}</p>}
        </div>
        <ChevronDown
          size={18}
          className={`text-[#a39e94] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-[#f0ebe3] p-4 text-sm text-[#5c564f]">
          <img
            src={img}
            alt={name}
            className="w-full h-32 object-cover rounded-lg mb-3"
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/${encodeURIComponent(name)}/640/320`;
            }}
          />
          {item.description && <p>{item.description}</p>}
        </div>
      )}
    </div>
  );
}
