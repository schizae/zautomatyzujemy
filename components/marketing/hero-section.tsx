'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

const ease = [0.21, 0.47, 0.32, 0.98] as const

interface HeroSectionProps {
  content: Record<string, string>
}

export function HeroSection({ content }: HeroSectionProps) {
  // Tytuł może zawierać placeholder {{AI}} dla podświetlonego wyrazu.
  // Fallback używa %%AI%% jako separatora w stringu domyślnym.
  const rawTitle = content['hero_title'] ?? 'Precyzja\u00a0%%AI%%\u00a0w Infrastrukturze.'
  // Obsługa starego formatu (bez placeholder) — zachowaj kompatybilność
  const title = rawTitle.includes('%%') ? rawTitle : rawTitle.replace('AI', '%%AI%%')
  const description =
    content['hero_description'] ??
    'Nie tylko budujemy boty. Tworzymy dedykowane warstwy automatyzacji i sztucznej inteligencji dostosowane pod Twoje systemy.'
  const ctaPrimary = content['hero_cta_primary'] ?? 'Rozpocznij Swoją Transformację'
  const ctaSecondary = content['hero_cta_secondary'] ?? 'Eksploruj możliwości'

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 px-6 md:px-8 max-w-screen-2xl mx-auto overflow-hidden">
      {/* Background glow top-right */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#70e5ea]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full py-16">
        {/* Left: Text content */}
        <div className="lg:col-span-7 z-10">
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#282a28] mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
          >
            <span className="w-2 h-2 rounded-full bg-[#ffa07b] animate-pulse shadow-[0_0_8px_#ffa07b]" />
            <span className="text-xs font-label uppercase tracking-widest text-[#bcc9c9]">
              PROJEKTUJEMY PRZYSZŁOŚĆ
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-6xl md:text-8xl font-headline font-bold leading-[0.9] tracking-tighter mb-8 text-[#e2e3df]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease }}
          >
            {title.includes('%%AI%%') ? (
              <>
                {title.split('%%AI%%')[0]}
                <span className="text-[#70e5ea] italic">AI</span>
                {title.split('%%AI%%')[1]}
              </>
            ) : (
              title
            )}
          </motion.h1>

          {/* Description */}
          <motion.p
            className="text-xl md:text-2xl text-[#bcc9c9] max-w-xl mb-12 font-light leading-relaxed font-body"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5, ease }}
          >
            {description}
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-wrap gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7, ease }}
          >
            <Link
              href="/#kontakt"
              className="px-10 py-5 rounded-full bg-[#70e5ea] text-[#003739] font-headline font-bold text-lg hover:brightness-110 transition-all"
            >
              {ctaPrimary}
            </Link>
            <Link
              href="/#uslugi"
              className="px-10 py-5 rounded-full border border-[#3d4949] hover:bg-[#282a28] transition-all text-[#e2e3df] font-headline font-bold text-lg"
            >
              {ctaSecondary}
            </Link>
          </motion.div>
        </div>

        {/* Right: Image + stats */}
        <div className="lg:col-span-5 relative hidden lg:block">
          <motion.div
            className="aspect-square relative rounded-[4rem] overflow-hidden group"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease }}
          >
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0_0O7fIuIol2OysfIT6g2TQOonKCC3u9yHtt-Q7d7f4qecegF2cPoeci8oifEd8LS9J2uJTxKD4CUu4ZxyikZQzp2NTF2-WwUacceI-pHcqGurB_yBG-ofdxhl-GvXyI9ayVZjOqC7GIa-kE_dBEgfZfxUBnQLewzklw4uN4XTfwSlz6jqHVc33dh7jBivpxaraamZrSAst7jGoIUWi48GuXueOSLbLW409fYmkRaHKtGa0cu0YBEt81HABO-LEKRjZSWW4rpGVKN"
              alt="Futurystyczna krystaliczna struktura AI symbolizująca automatyzację procesów"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#121412] via-transparent to-transparent" />
          </motion.div>

          {/* Stats overlap card */}
          <motion.div
            className="absolute -bottom-6 -left-6 glass-card p-8 rounded-3xl border border-[#3d4949]/20 max-w-[200px]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.9, ease }}
          >
            <div className="text-4xl font-headline font-bold text-[#70e5ea] mb-1">40h</div>
            <div className="text-xs font-label text-[#bcc9c9] uppercase tracking-widest leading-tight">
              TYGODNIOWO OSZCZĘDNOŚCI DLA KLIENTÓW PO AUTOMATYZACJI
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
