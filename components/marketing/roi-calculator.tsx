'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type FrequencyUnit = 'per_day' | 'per_week' | 'per_month'

const MONTHLY_MULTIPLIER: Record<FrequencyUnit, number> = {
  per_day: 22,
  per_week: 4.33,
  per_month: 1,
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  if (min === 60) return '1 h'
  if (min % 60 === 0) return `${min / 60} h`
  return `${Math.floor(min / 60)} h ${min % 60} min`
}

function formatPeople(n: number): string {
  if (n === 1) return '1 osoba'
  if (n <= 4) return `${n} osoby`
  return `${n} osób`
}

function SliderInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  displayValue,
  minLabel,
  maxLabel,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  displayValue: string
  minLabel: string
  maxLabel: string
}) {

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-label uppercase tracking-wider text-[#686862]">{label}</span>
        <motion.span
          key={displayValue}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="text-xl font-headline font-bold text-[#c93820]"
        >
          {displayValue}
        </motion.span>
      </div>
      <div className="relative">
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full cursor-pointer accent-[#c93820]"
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-[#686862] font-body">{minLabel}</span>
        <span className="text-xs text-[#686862] font-body">{maxLabel}</span>
      </div>
    </div>
  )
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
    <div className={`rounded-2xl border bg-[#ffffff] p-5 ${accent}`}>
      <p className="text-xs font-label uppercase tracking-wider text-[#686862] mb-2">{label}</p>
      <motion.p
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`text-xl font-headline font-bold mb-1 ${accent.split(' ')[0]}`}
      >
        {value}
      </motion.p>
      <p className="text-[#686862] text-xs font-body">{description}</p>
    </div>
  )
}

export function RoiCalculator() {
  const [taskMinutes, setTaskMinutes] = useState(30)      // 5–240 min
  const [frequencyCount, setFrequencyCount] = useState(3)  // 1–30
  const [frequencyUnit, setFrequencyUnit] = useState<FrequencyUnit>('per_day')
  const [hourlyRate, setHourlyRate] = useState(60)          // 20–300 PLN
  const [people, setPeople] = useState(2)                   // 1–30

  const results = useMemo(() => {
    const executionsPerMonth = frequencyCount * MONTHLY_MULTIPLIER[frequencyUnit]
    const hoursPerMonth = (taskMinutes / 60) * executionsPerMonth * people
    const costPerMonth = hoursPerMonth * hourlyRate
    // Scenario assumption; not a guaranteed saving or benchmark.
    const savingsPerMonth = costPerMonth * 0.7
    return {
      hoursPerMonth: Math.round(hoursPerMonth * 10) / 10,
      costPerMonth: Math.round(costPerMonth),
      savingsPerMonth: Math.round(savingsPerMonth),
      annualSavings: Math.round(savingsPerMonth * 12),
    }
  }, [taskMinutes, frequencyCount, frequencyUnit, hourlyRate, people])

  const unitTabs: { value: FrequencyUnit; label: string }[] = [
    { value: 'per_day', label: 'dziennie' },
    { value: 'per_week', label: 'tygodniowo' },
    { value: 'per_month', label: 'miesięcznie' },
  ]

  return (
    <section id="kalkulator" className="py-24 px-6 md:px-8 bg-[#f5f2ed]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c93820]/10 border border-[#c93820]/20 mb-6">
            <Calculator size={13} className="text-[#c93820]" />
            <span className="text-xs font-label uppercase tracking-widest text-[#c93820]">Kalkulator ROI</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-headline font-bold text-[#151719] mb-4">
            Ile kosztuje{' '}
            <span className="text-[#c93820]">Twoja rutyna?</span>
          </h2>
          <p className="text-[#686862] font-body text-lg max-w-2xl mx-auto">
            Wpisz dane o jednym powtarzalnym zadaniu w Twojej firmie i sprawdź,
            ile możesz zaoszczędzić dzięki automatyzacji.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT — sliders */}
          <div className="rounded-3xl border border-[#c7c3bb]/30 bg-[#ffffff] p-8 md:p-10 space-y-10">

            {/* 1. Czas trwania */}
            <SliderInput
              label="Czas trwania jednego wykonania"
              value={taskMinutes}
              min={5}
              max={240}
              step={5}
              onChange={setTaskMinutes}
              displayValue={formatDuration(taskMinutes)}
              minLabel="5 min"
              maxLabel="4 h"
            />

            {/* 2. Częstotliwość */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-label uppercase tracking-wider text-[#686862]">
                  Jak często to zadanie jest wykonywane?
                </span>
                <motion.span
                  key={`${frequencyCount}-${frequencyUnit}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-xl font-headline font-bold text-[#c93820]"
                >
                  {frequencyCount}× {unitTabs.find(u => u.value === frequencyUnit)?.label}
                </motion.span>
              </div>

              {/* Unit tabs */}
              <div className="flex rounded-xl bg-[#f5f2ed] border border-[#c7c3bb]/30 p-1 mb-4">
                {unitTabs.map(tab => (
                  <Button
                    key={tab.value}
                    onClick={() => setFrequencyUnit(tab.value)}
                    className={`flex-1 py-2 text-xs font-label rounded-lg transition-all ${
                      frequencyUnit === tab.value
                        ? 'bg-[#c93820]/10 text-[#c93820] border border-[#c93820]/30'
                        : 'text-[#686862] hover:text-[#686862]'
                    }`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* Count slider */}
              <div className="relative">
                <input
                  type="range"
                  aria-label="Liczba wykonań zadania"
                  min={1}
                  max={30}
                  step={1}
                  value={frequencyCount}
                  onChange={e => setFrequencyCount(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full cursor-pointer accent-[#c93820]"
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-[#686862] font-body">1×</span>
                <span className="text-xs text-[#686862] font-body">30×</span>
              </div>
            </div>

            {/* 3. Stawka godzinowa */}
            <SliderInput
              label="Stawka godzinowa pracownika (PLN/h)"
              value={hourlyRate}
              min={20}
              max={300}
              step={5}
              onChange={setHourlyRate}
              displayValue={`${hourlyRate} zł/h`}
              minLabel="20 zł"
              maxLabel="300 zł"
            />

            {/* 4. Liczba osób */}
            <SliderInput
              label="Liczba osób wykonujących to zadanie"
              value={people}
              min={1}
              max={30}
              step={1}
              onChange={setPeople}
              displayValue={formatPeople(people)}
              minLabel="1 osoba"
              maxLabel="30 osób"
            />
          </div>

          {/* RIGHT — results */}
          <div className="flex flex-col gap-4">

            {/* 3 metric cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ResultCard
                label="Czas/miesiąc"
                value={`${results.hoursPerMonth} h`}
                description="tracisz na to zadanie"
                accent="text-[#c93820] border-[#c93820]/20"
              />
              <ResultCard
                label="Koszt/miesiąc"
                value={`${results.costPerMonth.toLocaleString('pl-PL')} zł`}
                description="przy obecnym sposobie"
                accent="text-[#c93820] border-[#c93820]/20"
              />
              <ResultCard
                label="Oszcz./rok"
                value={`${results.annualSavings.toLocaleString('pl-PL')} zł`}
                description="po automatyzacji"
                accent="text-[#315e49] border-[#315e49]/20"
              />
            </div>

            {/* Big savings highlight */}
            <div className="flex-1 rounded-2xl border border-[#151719] bg-[#151719] [&_p]:text-[#c0bfba] [&_p.text-5xl]:text-[#f5f2ed] [&_span]:text-[#ffab98] p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-label uppercase tracking-widest text-[#c93820] mb-3">
                  Szacowana wartość odzyskanego czasu / miesiąc
                </p>
                <motion.p
                  key={results.savingsPerMonth}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-5xl md:text-6xl font-headline font-bold text-[#151719] mb-3"
                >
                  {results.savingsPerMonth.toLocaleString('pl-PL')}{' '}
                  <span className="text-[#c93820]">zł</span>
                </motion.p>
                <p className="text-[#686862] text-sm font-body leading-relaxed">
                  Założenie: 70% redukcji czasu. Wynik orientacyjny — nie uwzględnia kosztu wdrożenia, utrzymania i nadzoru.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  href="/#kontakt"
                  className="flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-[#c93820] text-[#ffffff] font-headline font-bold text-base hover:brightness-110 transition-all shadow-lg hover:shadow-[#c93820]/20 hover:-translate-y-0.5"
                >
                  Zautomatyzujmy to →
                </Link>
                <p className="text-[#686862] text-xs font-body text-center mt-3">
                  Bezpłatna konsultacja · bez zobowiązań
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[#686862] text-xs font-body mt-8">
          * Obliczenia bazują na rzeczywistym czasie pracy (22 dni robocze/miesiąc, 4,33 tygodnie/miesiąc).
          70% to założenie scenariusza, nie gwarancja oszczędności finansowych.
        </p>
      </div>
    </section>
  )
}
