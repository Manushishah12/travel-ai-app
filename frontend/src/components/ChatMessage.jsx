import {
  Castle,
  UtensilsCrossed,
  Sun,
  Palette,
  Users,
  User,
  Heart,
  Home,
} from "lucide-react";
import { chatDisplayText } from "../lib/utils";

const QUICK_REPLIES = [
  {
    match: /interests|experiences|what kind/i,
    options: [
      { label: "History & forts", icon: Castle },
      { label: "Food & markets", icon: UtensilsCrossed },
      { label: "Desert adventure", icon: Sun },
      { label: "Arts & culture", icon: Palette },
    ],
  },
  {
    match: /budget per day|rough budget|daily budget/i,
    options: [
      { label: "₹1,500–3,000", icon: null },
      { label: "₹3,000–7,000", icon: null },
      { label: "₹7,000+", icon: null },
    ],
  },
  {
    match: /solo|couple|family|travelling with|traveling with|who are you/i,
    options: [
      { label: "Solo", icon: User },
      { label: "Couple", icon: Heart },
      { label: "Family", icon: Home },
      { label: "Friends", icon: Users },
    ],
  },
];

export function getQuickReplies(content) {
  if (!content) return null;
  for (const q of QUICK_REPLIES) {
    if (q.match.test(content)) return q.options;
  }
  return null;
}

export default function ChatMessage({ message, onQuickReply, variant = "default" }) {
  const isUser = message.role === "user";
  const isSuccess = variant === "success";
  const text = isUser ? message.content : chatDisplayText(message.content);
  const quick = !isUser && !isSuccess ? getQuickReplies(message.content) : null;

  let bubbleClass =
    "max-w-[88%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed chat-prose shadow-sm ";
  if (isSuccess) {
    bubbleClass += "bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl";
  } else if (isUser) {
    bubbleClass += "bg-[#dce8f7] text-slate-800 rounded-br-md border border-[#c5d9ef]";
  } else {
    bubbleClass += "bg-[#f5f0e8] text-slate-800 rounded-bl-md border border-[#ebe4d8]";
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={bubbleClass}>
        <p className="whitespace-pre-wrap">{text}</p>
        {quick && onQuickReply && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[#e5ddd0]">
            {quick.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onQuickReply(opt.label)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full bg-white/90 text-slate-700 border border-[#e0d8cc] hover:bg-white hover:border-[#c9bfb0] transition-colors"
                >
                  {Icon && <Icon size={14} className="text-[#5a7fa8]" />}
                  {opt.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
