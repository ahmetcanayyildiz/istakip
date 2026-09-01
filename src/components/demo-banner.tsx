export default function DemoBanner() {
  return (
    <aside
      aria-label="Demo modu"
      className="border-b border-warning-border bg-warning-soft px-4 py-2 text-center text-sm text-warning sm:px-6 lg:px-8"
    >
      <span className="font-semibold">Demo modu:</span>{" "}
      Veriler salt okunurdur; ekleme, düzenleme ve silme işlemleri kapalıdır.
    </aside>
  );
}
