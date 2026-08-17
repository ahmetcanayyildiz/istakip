export default function AuthMessage({
  tone,
  children,
}: {
  tone: "error" | "success" | "info";
  children: string;
}) {
  const styles = {
    error: "border-rose-200 bg-rose-50 text-rose-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    info: "border-brand-200 bg-brand-50 text-brand-900",
  }[tone];

  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-md border px-3 py-2.5 text-sm ${styles}`}>
      {children}
    </p>
  );
}
