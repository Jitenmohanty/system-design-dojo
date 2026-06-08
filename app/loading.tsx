export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse px-6 pt-10">
      <div className="flex gap-2">
        <div className="h-6 w-24 rounded-full bg-white/5" />
        <div className="h-6 w-16 rounded-full bg-white/5" />
      </div>
      <div className="mt-4 h-12 w-2/3 rounded-xl bg-white/5" />
      <div className="mt-3 h-5 w-1/2 rounded-lg bg-white/5" />
      <div className="mt-8 h-28 w-full rounded-2xl bg-white/5" />
      <div className="mt-6 space-y-3">
        <div className="h-4 w-full rounded bg-white/5" />
        <div className="h-4 w-5/6 rounded bg-white/5" />
        <div className="h-4 w-4/6 rounded bg-white/5" />
      </div>
      <div className="mt-8 h-64 w-full rounded-2xl bg-white/5" />
    </div>
  );
}
