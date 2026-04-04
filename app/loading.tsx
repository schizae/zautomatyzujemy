export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0f0d]">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 animate-spin rounded-full border-2 border-[#3d4949] border-t-[#70e5ea]" />
        <p className="text-sm text-[#3d4949] font-label uppercase tracking-widest">
          Ładowanie...
        </p>
      </div>
    </main>
  )
}
