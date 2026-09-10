import { AI_SYSTEMS } from '@/lib/ai-registry'

export const metadata = { title: 'Rejestr AI — Admin' }

export default function AdminAiRegistryPage() {
  return (
    <div>
      <h1 className="font-headline text-2xl font-bold text-on-surface">Rejestr systemów AI</h1>
      <p className="mt-1 max-w-2xl text-sm text-on-surface-variant">
        Wykaz wewnętrzny. Nie jest publikowany na stronie ani dostępny bez zalogowania.
      </p>

      <div className="mt-6 space-y-4">
        {AI_SYSTEMS.map(system => (
          <div
            key={system.name}
            className="rounded-2xl border border-outline-variant bg-surface-container p-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold text-on-surface">{system.name}</h2>
              <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-xs font-medium text-on-surface-variant">
                {system.role}
              </span>
            </div>

            <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-outline-color">Model</dt>
                <dd className="mt-1 text-on-surface-variant">{system.model}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-outline-color">Cel</dt>
                <dd className="mt-1 text-on-surface-variant">{system.purpose}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-outline-color">Dane wejściowe</dt>
                <dd className="mt-1 text-on-surface-variant">{system.inputs}</dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  )
}
