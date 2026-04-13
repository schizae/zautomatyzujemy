import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'

export function AiActBanner() {
  return (
    <div className="w-full bg-gradient-to-r from-[#1a1208] via-[#1f1a0a] to-[#1a1208] border-y border-[#ffa07b]/15">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center sm:text-left">
        {/* Icon + text */}
        <div className="flex items-center gap-3">
          <AlertTriangle className="text-[#ffa07b] shrink-0" size={18} />
          <p className="text-sm font-body text-[#e2e3df]">
            <span className="font-headline font-bold text-[#ffa07b]">AI Act</span>
            {' '}wchodzi w życie{' '}
            <span className="font-bold">2 sierpnia 2026.</span>
            {' '}Czy Twoja firma jest gotowa?
          </p>
        </div>

        {/* CTA */}
        <Link
          href="#uslugi"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#ffa07b]/10 border border-[#ffa07b]/30 text-[#ffa07b] text-xs font-label font-bold uppercase tracking-wider hover:bg-[#ffa07b]/20 transition-colors"
        >
          Sprawdź zgodność
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  )
}
