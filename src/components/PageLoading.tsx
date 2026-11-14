export default function PageLoading({ label }: { label: string }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10">
      <div className="h-10 w-2/3 animate-pulse rounded-xl bg-white/10" />
      <div className="h-5 w-1/2 animate-pulse rounded-lg bg-white/5" />
      <div className="h-72 animate-pulse rounded-2xl bg-white/5" />
      <span className="text-sm text-white/40">{label}</span>
    </div>
  );
}
