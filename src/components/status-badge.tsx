type Tone = "positive" | "progress" | "warning" | "neutral" | "danger";

const TONE_STYLES: Record<Tone, string> = {
  positive: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  progress: "bg-brand-50 text-brand-800 ring-brand-600/20",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/20",
  neutral: "bg-slate-100 text-slate-700 ring-slate-500/20",
  danger: "bg-rose-50 text-rose-800 ring-rose-600/20",
};

const STATUS_TONES: Record<string, Tone> = {
  "Devam ediyor": "progress",
  Tamamlandı: "positive",
  Onaylandı: "positive",
  Beklemede: "warning",
  Gönderildi: "neutral",
  Reddedildi: "danger",
};

export default function StatusBadge({ status }: { status: string }) {
  const tone = STATUS_TONES[status] ?? "neutral";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${TONE_STYLES[tone]}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
