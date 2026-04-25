'use client'

import { Download } from 'lucide-react'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#3d4949]/40 text-[#bcc9c9] text-sm font-label hover:border-[#70e5ea]/40 hover:text-[#70e5ea] transition-colors print:hidden"
    >
      <Download size={14} />
      Pobierz jako PDF
    </button>
  )
}
