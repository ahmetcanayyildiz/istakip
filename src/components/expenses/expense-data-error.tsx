export default function ExpenseDataError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-danger-border bg-danger-soft px-5 py-4 text-sm text-danger shadow-xs"
    >
      {message}
    </div>
  );
}
