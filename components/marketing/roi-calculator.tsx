'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Clock, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

type FrequencyUnit = 'per_day' | 'per_week' | 'per_month'

const MONTHLY_MULTIPLIER: Record<FrequencyUnit, number> = {
  per_day: 22,
  per_week: 4.33,
  per_month: 1,
}

const UNIT_LABELS: Record<FrequencyUnit, string> = {
  per_day: 'razy dziennie',
  per_week: 'razy w tygodniu',
  per_month: 'razy w miesiącu',
}

const TASK_DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120]
const FREQUENCY_COUNT_OPTIONS = [1, 2, 3, 5, 10, 20]
const HOURLY_RATE_OPTIONS = [30, 40, 50, 60, 80, 100, 120, 150, 200]
const PEOPLE_OPTIONS = [1, 2, 3, 5, 10, 15, 20]

function formatDuration(min: number): string {
  return min < 60 ? `${min} min` : `${min / 60} h`
}

function ResultCard({
  label,
  value,
  description,
  accent,
}: {
  label: string
  value: string
  description: string
  accent: string
}) {
  return (
    <div className={`rounded-2xl border bg-[#111311] p-5 ${accent}`}>
      <p className="text-xs font-label uppercase tracking-wider text-[#bcc9c9] mb-2">{label}</p>
      <motion.p
        key={value}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`text-xl font-headline font-bold mb-1 ${accent.split(' ')[0]}`}
      >
        {value}
      </motion.p>
      <p className="text-[#5a6464] text-xs font-body">{description}</p>
    </div>
  )
}

export function RoiCalculator() {
  const [taskMinutes, setTaskMinutes] = useState(30)
  const [frequencyCount, setFrequencyCount] = useState(1)
  const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>('per_day')
  const [hourlyRate, setHourlyRate] = useState(50)
  const [people, setPeople] = useState(1)

  const results = useMemo(() => {
    const executionsPerMonth = frequencyCount * MONTHLY_MULTIPLIER[frequencyUnit]
    const hoursPerMonth = (taskMinutes / 60) * executionsPerMonth * people
    const costPerMonth = hoursPerMonth * hourlyRate
    // 70% time savings — industry benchmark (McKinsey Global Institute, 2023)
    const savingsPerMonth = costPerMonth * 0.7
    return {
      hoursPerMonth: Math.round(hoursPerMonth * 10) / 10,
      costPerMonth: Math.round(costPerMonth),
      savingsPerMonth: Math.round(savingsPerMonth),
      annualSavings: Math.round(savingsPerMonth * 12),
    }
  }, [taskMinutes, frequencyCount, frequencyUnit, hourlyRate, people])

  const pillBase = 'px-3 py-1.5 rounded-lg text-sm font-label transition-all'
  const pillActive = 'bg-[#70e5ea] text-[#003739] font-bold'
  const pillIdle = 'border border-[#3d4949]/40 text-[#bcc9c9] hover:border-[#70e5ea]/40'

  return (
    <section className="py-24 px-6 md:px-8 bg-[#0d0f0d]">
      <div className="max-w-screen-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#70e5ea]/10 border border-[#70e5ea]/20 mb-6">
            <Calculator size={13} className="text-[#70e5ea]" />
            <span className="text-xs font-label uppercase tracking-widest text-[#70e5ea]">Kalkulator ROI</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-[#e2e3df] mb-4">
            Ile kosztuje Cię{' '}
            <span className="text-[#70e5ea]">ręczna robota?</span>
          </h2>
          <p className="text-[#bcc9c9] font-body text-lg max-w-2xl mx-auto">
            Wpisz dane o jednym powtarzalnym zadaniu w Twojej firmie i sprawdź,
            ile możesz zaoszczędzić dzięki automatyzacji.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT — inputs */}
          <div className="rounded-3xl border border-[#3d4949]/30 bg-[#111311] p-8 md:p-10 space-y-8">

            {/* Task duration */}
            <div>
              <label className="flex items-center gap-2 text-xs font-label uppercase tracking-wider text-[#bcc9c9] mb-4">
                <Clock size={13} />
                Czas trwania jednego wykonania
              </label>
              <div className="flex flex-wrap gap-2">
                {TASK_DURATION_OPTIONS.map(min => (
                  <button
                    key={min}
                    onClick={() => setTaskMinutes(min)}
                    className={`${pillBase} ${taskMinutes === min ? pillActive : pillIdle}`}
                  >
                    {formatDuration(min)}
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency */}
            <div>
              <label className="flex items-center gap-2 text-xs font-label uppercase tracking-wider text-[#bcc9c9] mb-4">
                <TrendingUp size={13} />
                Jak często to zadanie jest wykonywane?
              </label>
              <div className="flex gap-3">
                <select
                  value={frequencyCount}
                  onChange={e => setFrequencyCount(Number(e.target.value))}
                  className="bg-[#1a1c1a] border border-[#3d4949]/30 rounded-xl px-4 py-2.5 text-[#e2e3df] text-sm font-body outline-none focus:border-[#70e5ea]/50 transition-colors"
                >
                  {FREQUENCY_COUNT_OPTIONS.map(n => (
                    <option key={n} value={n}>{n}×</option>
                  ))}
                </select>
                <select
                  value={frequencyUnit}
                  onChange={e => setFrequencyUnit(e.target.value as FrequencyUnit)}
                  className="flex-1 bg-[#1a1c1a] border border-[#3d4949]/30 rounded-xl px-4 py-2.5 text-[#e2e3df] text-sm font-body outline-none focus:border-[#70e5ea]/50 transition-colors"
                >
                  {(Object.entries(UNIT_LABELS) as [FrequencyUnit, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hourly rate */}
            <div>
              <label className="flex items-center gap-2 text-xs font-label uppercase tracking-wider text-[#bcc9c9] mb-4">
                Stawka godzinowa pracownika (PLN/h)
              </label>
              <div className="flex flex-wrap gap-2">
                {HOURLY_RATE_OPTIONS.map(rate => (
                  <button
                    key={rate}
                    onClick={() => setHourlyRate(rate)}
                    className={`${pillBase} ${hourlyRate === rate ? pillActive : pillIdle}`}
                  >
                    {rate} zł
                  </button>
                ))}
              </div>
            </div>

            {/* Number of people */}
            <div>
              <label className="flex items-center gap-2 text-xs font-label uppercase tracking-wider text-[#bcc9c9] mb-4">
                <Users size={13} />
                Liczba osób wykonujących to zadanie
              </label>
              <div className="flex flex-wrap gap-2">
                {PEOPLE_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => setPeople(n)}
                    className={`${pillBase} ${people === n ? pillActive : pillIdle}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — results */}
          <div className="flex flex-col gap-4">

            {/* 3 metric cards */}
            <div className="grid grid-cols-3 gap-4">
              <ResultCard
                label="Czas/miesiąc"
                value={`${results.hoursPerMonth} h`}
                description="tracisz na to zadanie"
                accent="text-[#70e5ea] border-[#70e5ea]/20"
              />
              <ResultCard
                label="Koszt/miesiąc"
                value={`${results.costPerMonth.toLocaleString('pl-PL')} zł`}
                description="przy obecnym sposobie"
                accent="text-[#ffa07b] border-[#ffa07b]/20"
              />
              <ResultCard
                label="Oszcz./rok"
                value={`${results.annualSavings.toLocaleString('pl-PL')} zł`}
                description="po automatyzacji"
                accent="text-[#7bc87b] border-[#7bc87b]/20"
              />
            </div>

            {/* Big savings highlight */}
            <div className="flex-1 rounded-3xl border border-[#70e5ea]/20 bg-gradient-to-br from-[#0d1f1f] to-[#111311] p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-label uppercase tracking-widest text-[#70e5ea] mb-3">
                  Miesięczna oszczędność po automatyzacji
                </p>
                <motion.p
                  key={results.savingsPerMonth}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-5xl md:text-6xl font-headline font-bold text-[#e2e3df] mb-3"
                >
                  {results.savingsPerMonth.toLocaleString('pl-PL')}{' '}
                  <span className="text-[#70e5ea]">zł</span>
                </motion.p>
                <p className="text-[#bcc9c9] text-sm font-body leading-relaxed">
                  Szacunek dla jednego zadania przy 70% redukcji czasu — tyle typowo osiągają firmy
                  wdrażające automatyzację procesów biurowych (McKinsey, 2023).
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/#kontakt"
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-[#70e5ea] text-[#003739] font-headline font-bold text-base hover:brightness-110 transition-all shadow-lg hover:shadow-[#70e5ea]/20 hover:-translate-y-0.5"
                >
                  Zautomatyzujmy to →
                </Link>
                <p className="text-[#5a6464] text-xs font-body text-center mt-3">
                  Bezpłatna konsultacja · bez zobowiązań
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[#5a6464] text-xs font-body mt-8">
          * Obliczenia bazują na rzeczywistym czasie pracy (22 dni robocze/miesiąc, 4,33 tygodnie/miesiąc).
          Wskaźnik 70% oszczędności to konserwatywne minimum wg McKinsey Global Institute (2023).
        </p>
      </div>
    </section>
  )
}
