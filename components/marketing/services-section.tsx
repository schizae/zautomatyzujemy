import Image from 'next/image'
import { Brain, Bot, GraduationCap, Building2, ArrowRight } from 'lucide-react'

const services = [
  {
    id: 'llm',
    icon: Brain,
    iconColor: 'text-[#70e5ea]',
    title: 'Implementacja LLM',
    description:
      'Systemy lokalne i chmurowe, dostrojone pod Twoje potrzeby, zapewniające należyte bezpieczeństwo danych oraz maksymalną precyzję.',
    span: 'md:col-span-2',
    variant: 'primary',
  },
  {
    id: 'automation',
    icon: Bot,
    iconColor: 'text-[#ffc7b3]',
    title: "Autonomiczne Workflow's",
    description:
      'Samokorygujący się autonomiczni agenci zarządzają złożonymi procesami biznesowymi na wielu platformach 24/7.',
    span: '',
    variant: 'secondary',
  },
  {
    id: 'training',
    icon: GraduationCap,
    iconColor: 'text-[#70e5ea]',
    title: 'Szkolenia zespołowe',
    description:
      'Szkolimy zespoły z nowoczesnych technologii, aby potrafiły wykorzystać pełnię możliwości, które oferują.',
    span: '',
    variant: 'secondary',
  },
  {
    id: 'strategy',
    icon: Building2,
    iconColor: 'text-[#50c9ce]',
    title: 'Wdrożenia AI w Firmach',
    description:
      'Konsultujemy i pomagamy wdrożyć AI w firmach w sektorach, gdzie naprawdę warto to zrobić, aby zachować konkurencyjność.',
    span: 'md:col-span-2',
    variant: 'gradient',
  },
]

export function ServicesSection() {
  return (
    <section className="py-32 px-6 md:px-8 max-w-screen-2xl mx-auto" id="uslugi">
      {/* Section header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tight mb-6 text-[#e2e3df]">
            Oszczędność czasu
            <br />i pieniędzy.
          </h2>
          <p className="text-[#bcc9c9] text-lg font-body">
            Oszczędź pieniądze i Twój cenny czas, zatrudniając automatyczne systemy
            wykorzystujące sztuczną inteligencję.
          </p>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LLM — wide card */}
        <div className="md:col-span-2 bg-[#1a1c1a] p-10 rounded-[2.5rem] flex flex-col justify-between group hover:bg-[#1e201e] transition-colors duration-500">
          <div>
            <Brain className="text-[#70e5ea] mb-8" size={48} />
            <h3 className="text-3xl font-headline font-bold mb-4 text-[#e2e3df]">
              Implementacja LLM
            </h3>
            <p className="text-[#bcc9c9] text-lg max-w-md font-body">
              Systemy lokalne i chmurowe, dostrojone pod Twoje potrzeby, zapewniające
              należyte bezpieczeństwo danych oraz maksymalną precyzję.
            </p>
          </div>
          <div className="mt-12 flex items-center justify-between">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  aria-hidden="true"
                  className="w-10 h-10 rounded-full border-2 border-[#1a1c1a] bg-[#282a28]"
                />
              ))}
            </div>
            <ArrowRight
              className="text-[#70e5ea] group-hover:translate-x-2 transition-transform"
              size={24}
            />
          </div>
        </div>

        {/* Automation — narrow card */}
        <div className="bg-[#1e201e] p-10 rounded-[2.5rem] border border-[#3d4949]/10">
          <Bot className="text-[#ffc7b3] mb-6" size={40} />
          <h3 className="text-2xl font-headline font-bold mb-4 text-[#e2e3df]">
            Autonomiczne Workflow&apos;s
          </h3>
          <p className="text-[#bcc9c9] font-body">
            Samokorygujący się autonomiczni agenci zarządzają złożonymi procesami
            biznesowymi na wielu platformach 24/7.
          </p>
        </div>

        {/* Training — narrow card */}
        <div className="bg-[#1e201e] p-10 rounded-[2.5rem] border border-[#3d4949]/10">
          <GraduationCap className="text-[#70e5ea] mb-6" size={40} />
          <h3 className="text-2xl font-headline font-bold mb-4 text-[#e2e3df]">
            Szkolenia zespołowe
          </h3>
          <p className="text-[#bcc9c9] font-body">
            Szkolimy zespoły z nowoczesnych technologii, aby potrafiły wykorzystać
            pełnię możliwości, które oferują.
          </p>
        </div>

        {/* Strategy — wide card with image */}
        <div className="md:col-span-2 bg-gradient-to-br from-[#1a1c1a] to-[#333533] p-10 rounded-[2.5rem] flex items-center gap-12 overflow-hidden relative">
          <div className="relative z-10 flex-1">
            <Building2 className="text-[#50c9ce] mb-6" size={40} />
            <h3 className="text-2xl font-headline font-bold mb-4 text-[#e2e3df]">
              Wdrożenia AI w Firmach
            </h3>
            <p className="text-[#bcc9c9] max-w-xs font-body">
              Konsultujemy i pomagamy wdrożyć AI w firmach w sektorach, gdzie naprawdę
              warto to zrobić, aby zachować konkurencyjność.
            </p>
          </div>
          <div className="hidden lg:block relative z-10 flex-1 h-full">
            <div className="relative h-48 w-full">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHuh36ION_jAL0INUvstCyK6Jf2BWe_-YuLoxwwYMpQS0EeHAmu2YhCrjp3mfnUB3-Un6gOZcUuGC3inwz1kOMU4TVdHPu-lAzAGdEbsmxFTvmAGQ1POzxCSY_-RI1SUFh_A-IqiRulz6nUvD0XdazuqVT4E3C_vU6JWSmBikfE3_otsam3BE_C1RjA7HyOUV-i0cP4qaf9C3CgAP7jogorOM5mU3nEyIDTCBwq1YVsVGskMN7njn5S5gQ2WzOSINPxrixbrADAZOq"
                alt="Szczegółowe obwody komputerowe świecące cyjanowym światłem — wdrożenia AI"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="rounded-2xl object-cover opacity-50 grayscale contrast-125"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
