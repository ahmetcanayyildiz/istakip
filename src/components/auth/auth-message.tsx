export default function AuthMessage({
  tone,
  children,
}: {
  tone: "error" | "success" | "info";
  children: string;
}) {
  const styles = {
    error: "border-danger-border bg-danger-soft text-danger",
    success: "border-success-border bg-success-soft text-success",
    info: "border-brand-200 bg-brand-50 text-brand-900",
  }[tone];

  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-md border px-3 py-2.5 text-sm ${styles}`}>
      {children}
    </p>
  );
}
