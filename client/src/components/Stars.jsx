import { Star } from "lucide-react";
import { starsDisplay } from "../lib/utils";

export default function Stars({ rating, size = 14 }) {
  const { full, half, empty } = starsDisplay(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} size={size} fill="currentColor" />
      ))}
      {half && <Star size={size} fill="currentColor" className="opacity-50" />}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} size={size} className="text-slate-300" />
      ))}
    </span>
  );
}
