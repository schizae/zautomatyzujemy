'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
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
        <span className="text-sm font-semibold text-[#151719]">{label}</span>
        <motion.span
          key={displayValue}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="text-lg font-semibold text-[#151719]"
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
          className="w-full h-1.5 rounded-full cursor-pointer accent-[#f34c30]"
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-xs text-[#686862] font-body">{minLabel}</span>
        <span className="text-xs text-[#686862] font-body">{maxLabel}</span>
      </div>
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
    <section id="kalkulator" className="mx-auto grid max-w-[1600px] gap-12 px-6 py-20 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-24">
      <div>
        <p className="mb-8 text-xs uppercase tracking-[0.2em]"><span className="text-[#f34c30]">02 /</span> Policz potencjał</p>
        <h2 className="font-body text-5xl font-extrabold leading-[1.03] tracking-[-0.055em] xl:text-8xl">Ile kosztuje<br />Twoja <span className="font-editorial font-normal italic">rutyna?</span></h2>
        <p className="mt-8 max-w-xl text-xl leading-relaxed text-[#686862]">Sprawdź czas i koszt jednego powtarzalnego zadania w swojej firmie.</p>
        <p className="mt-16 font-body text-6xl font-extrabold tracking-[-0.06em] xl:text-8xl">{formatDuration(taskMinutes)}.</p>
        <p className="mt-3 text-[#686862]">Jedno zadanie. Powtarzane każdego {frequencyUnit === 'per_day' ? 'dnia' : frequencyUnit === 'per_week' ? 'tygodnia' : 'miesiąca'}.</p>
        <div className="mt-12 border-t border-[#c7c3bb] pt-6 text-sm uppercase tracking-widest text-[#686862]">Mniej rutyny. Więcej możliwości.</div>
      </div>
      <div className="min-w-0 rounded-xl border border-[#151719] bg-white/40 p-5 md:p-8">
        <div className="space-y-7">
          <SliderInput label="Czas zadania" value={taskMinutes} min={5} max={240} step={5} onChange={setTaskMinutes} displayValue={formatDuration(taskMinutes)} minLabel="5 min" maxLabel="4 h" />
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><span className="font-semibold">Częstotliwość — {frequencyCount}×</span><div className="flex flex-wrap gap-1">{unitTabs.map(tab => <Button key={tab.value} aria-pressed={frequencyUnit === tab.value} onClick={() => setFrequencyUnit(tab.value)} className={`h-auto rounded-md border bg-transparent px-3 py-2 text-xs ${frequencyUnit === tab.value ? 'border-[#f34c30] text-[#c93820]' : 'border-[#c7c3bb] text-[#686862]'}`}>{tab.label}</Button>)}</div></div>
            <input type="range" aria-label="Liczba wykonań zadania" min={1} max={30} step={1} value={frequencyCount} onChange={e => setFrequencyCount(Number(e.target.value))} className="w-full cursor-pointer accent-[#f34c30]" />
            <div className="mt-2 flex justify-between text-xs text-[#686862]"><span>1×</span><span>30×</span></div>
          </div>
          <SliderInput label="Koszt godziny" value={hourlyRate} min={20} max={300} step={5} onChange={setHourlyRate} displayValue={`${hourlyRate} zł`} minLabel="20 zł" maxLabel="300 zł" />
          <SliderInput label="Liczba osób" value={people} min={1} max={30} step={1} onChange={setPeople} displayValue={formatPeople(people)} minLabel="1 osoba" maxLabel="30 osób" />
        </div>
        <div className="my-8 grid gap-6 border-t border-[#c7c3bb] pt-6 sm:grid-cols-2">
          <div><p className="font-editorial text-5xl">{results.hoursPerMonth} h <span className="text-2xl">/ miesiąc</span></p><p className="mt-2 text-sm text-[#686862]">Czas pracy</p></div>
          <div><p className="font-editorial text-5xl">{results.costPerMonth.toLocaleString('pl-PL')} zł</p><p className="mt-2 text-sm text-[#686862]">Koszt pracy / miesiąc</p></div>
        </div>
        <div className="rounded-lg bg-[#151719] p-6 text-[#f5f2ed]">
          <p className="text-sm text-[#c0bfba]">Szacowana wartość odzyskanego czasu</p>
          <p className="my-4 font-editorial text-5xl xl:text-6xl">{results.savingsPerMonth.toLocaleString('pl-PL')} zł <span className="text-2xl">/ miesiąc</span></p>
          <p className="mb-5 text-sm text-[#c0bfba]">{results.annualSavings.toLocaleString('pl-PL')} zł / rok · założenie: 70% redukcji czasu.</p>
          <Button asChild className="h-auto whitespace-normal rounded-md bg-[#e84324] px-5 py-4 text-white hover:bg-[#c93820]"><Link href="/#kontakt">Omówmy ten proces ↗</Link></Button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-[#686862]">Wynik orientacyjny. 22 dni robocze lub 4,33 tygodnia w miesiącu. Nie uwzględnia kosztów wdrożenia, utrzymania i nadzoru; nie stanowi gwarancji oszczędności finansowych.</p>
      </div>
    </section>
  )
}
