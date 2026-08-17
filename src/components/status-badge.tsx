type Tone = "positive" | "progress" | "warning" | "neutral" | "danger";

const TONE_STYLES: Record<Tone, string> = {
  positive: "bg-success-soft text-success ring-success-ring",
  progress: "bg-brand-50 text-brand-800 ring-brand-600/20",
  warning: "bg-warning-soft text-warning ring-warning-ring",
  neutral: "bg-surface-strong text-foreground-secondary ring-neutral-ring",
  danger: "bg-danger-soft text-danger ring-danger-ring",
};

const STATUS_TONES: Record<string, Tone> = {
  Aktif: "positive",
  Pasif: "neutral",
  Taslak: "neutral",
  "Devam ediyor": "progress",
  "Devam Ediyor": "progress",
  Planlandı: "neutral",
  Tamamlandı: "positive",
  "İptal Edildi": "danger",
  Onaylandı: "positive",
  Beklemede: "warning",
  Gönderildi: "neutral",
  Reddedildi: "danger",
  "Tahsil Edildi": "positive",
  Bekliyor: "warning",
  "Vadesi Beklenen": "warning",
  Gecikmiş: "danger",
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
