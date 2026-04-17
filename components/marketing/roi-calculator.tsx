'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calculator } from 'lucide-react'
import Link from 'next/link'

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
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-label uppercase tracking-wider text-[#bcc9c9]">{label}</span>
        <motion.span
          key={displayValue}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="text-xl font-headline font-bold text-[#70e5ea]"
        >
          {displayValue}
        </motion.span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#70e5ea]"
          style={{
            background: `linear-gradient(to right, #70e5ea ${pct}%, #2a3333 ${pct}%)`,
          }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-[#5a6464] font-body">{minLabel}</span>
        <span className="text-xs text-[#5a6464] font-body">{maxLabel}</span>
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
    <div className={`rounded-2xl border bg-[#111311] p-5 ${accent}`}>
      <p className="text-xs font-label uppercase tracking-wider text-[#bcc9c9] mb-2">{label}</p>
      <motion.p
        key={value}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`text-xl font-headline font-bold mb-1 ${accent.split(' ')[0]}`}
      >
        {value}
      </motion.p>
      <p className="text-[#5a6464] text-xs font-body">{description}</p>
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
    // 70% time savings — industry benchmark (McKinsey Global Institute, 2023)
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

          {/* LEFT — sliders */}
          <div className="rounded-3xl border border-[#3d4949]/30 bg-[#111311] p-8 md:p-10 space-y-10">

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
                <span className="text-xs font-label uppercase tracking-wider text-[#bcc9c9]">
                  Jak często to zadanie jest wykonywane?
                </span>
                <motion.span
                  key={`${frequencyCount}-${frequencyUnit}`}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-xl font-headline font-bold text-[#70e5ea]"
                >
                  {frequencyCount}× {unitTabs.find(u => u.value === frequencyUnit)?.label}
                </motion.span>
              </div>

              {/* Unit tabs */}
              <div className="flex rounded-xl bg-[#0d0f0d] border border-[#3d4949]/30 p-1 mb-4">
                {unitTabs.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setFrequencyUnit(tab.value)}
                    className={`flex-1 py-2 text-xs font-label rounded-lg transition-all ${
                      frequencyUnit === tab.value
                        ? 'bg-[#70e5ea]/10 text-[#70e5ea] border border-[#70e5ea]/30'
                        : 'text-[#5a6464] hover:text-[#bcc9c9]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Count slider */}
              <div className="relative">
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={frequencyCount}
                  onChange={e => setFrequencyCount(Number(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#70e5ea]"
                  style={{
                    background: `linear-gradient(to right, #70e5ea ${((frequencyCount - 1) / 29) * 100}%, #2a3333 ${((frequencyCount - 1) / 29) * 100}%)`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-[#5a6464] font-body">1×</span>
                <span className="text-xs text-[#5a6464] font-body">30×</span>
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
