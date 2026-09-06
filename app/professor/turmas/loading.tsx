export default function CarregandoTurmas() {
  return (
    <main aria-busy="true" className="min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#172033] sm:px-6 sm:py-8 lg:px-10">
      <p role="status" className="font-[family-name:var(--font-manrope)] text-lg font-semibold">Carregando turmas...</p>
      <div aria-hidden="true" className="mt-8 grid gap-4 lg:grid-cols-2">
        {[0, 1].map((item) => (
          <div key={item} className="h-48 motion-safe:animate-pulse rounded-xl border border-[#172033]/10 bg-white shadow-sm sm:rounded-2xl" />
        ))}
      </div>
    </main>
  );
}
