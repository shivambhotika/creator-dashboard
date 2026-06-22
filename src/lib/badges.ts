export const tierBadge: Record<string, string> = {
  Nano:  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Micro: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Mid:   "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  Macro: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  Mega:  "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
};

export const statusBadge: Record<string, string> = {
  // Creator statuses
  Active:      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Past:        "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  Negotiating: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Paused:      "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  // Video statuses (simplified to Live / Scheduled)
  Live:        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Scheduled:   "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  // Video activity (computed from goLiveDate)
  Active_vid:  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  Exhausted:   "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  // Campaign statuses
  Completed:   "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  Planned:     "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
};

export const formatBadge: Record<string, string> = {
  Dedicated:   "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400",
  Integration: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400",
  Short:       "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  Story:       "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-400",
  Live:        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export const platformBadge: Record<string, string> = {
  YouTube:  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Instagram:"bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  TikTok:   "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  "Twitter/X": "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400",
  LinkedIn: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  Podcast:  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
};
