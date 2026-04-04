import { Bot, Brain } from 'lucide-react'
import {
  SlideIn,
  AnimatedCounter,
  FloatingElement,
} from '@/components/animations'
import { createServiceClient } from '@/lib/supabase/server'

export async function AboutSection() {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('page_content')
    .select('key, value')
    .in('key', ['about_title', 'about_text'])

  const content: Record<string, string> = Object.fromEntries(
    (data ?? []).map((item: { key: string; value: string }) => [item.key, item.value])
  )
  const title = content['about_title'] ?? 'Dlaczego Automatyzacja?'
  const text = content['about_text'] ?? 'Pomagamy firmom odzyskać czas i zasoby dzięki inteligentnym automatyzacjom opartym na AI i n8n.'
  return (
    <section className="py-24 bg-white" id="o-nas">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

          {/* Image — slides in from left */}
          <SlideIn direction="left">
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLkdCi-BdUmpLgnsYbzwt2kpE4f8WdFhflzmZIlPVZvuGwX3p9D6UVnay8RLks4sqqqnnwqRsEnJ8ulQxE3ykXvijhbD811FIdHkWleOIMNOQHd72jgEdBz3Jt1p8-7UmBmEJcdqZVRzYcpbef71L9AgbeoW5r9IMFE2Db70COV90xF9bowRCFObs23lPKbGptojxa5xTYfFrjwvmAs5smeDtDxzIksXDKPAi6s7mbOh2Ih1u_HHGqzcekXw28KV7HxVcDPCCtjDI"
                  alt="Zespół współpracujący przy wdrożeniu AI"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating stat card */}
              <FloatingElement
                className="absolute -bottom-10 -right-10 hidden md:block"
                amplitude={8}
                duration={3.5}
              >
                <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-100 max-w-xs">
                  <p className="text-primary font-bold text-4xl mb-1">
                    <AnimatedCounter to={50} suffix="+" />
                  </p>
                  <p className="text-slate-600 text-sm font-medium">
                    Udało nam się zoptymalizować procesy w ponad 50 firmach
                    w Polsce.
                  </p>
                </div>
              </FloatingElement>
            </div>
          </SlideIn>

          {/* Text — slides in from right */}
          <SlideIn direction="right" delay={0.15}>
            <h2 className="text-sm font-bold text-primary tracking-widest uppercase mb-4">
              Nasza Misja
            </h2>
            <h3 className="text-4xl font-bold mb-8 leading-tight">
              {title}
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed mb-10">
              {text}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: <Bot size={22} />,
                  title: 'Automatyzacje',
                  desc: 'Tworzymy spójne ekosystemy łączące Twoje ulubione narzędzia w jeden organizm.',
                },
                {
                  icon: <Brain size={22} />,
                  title: 'Sztuczna Inteligencja',
                  desc: 'Wdrażamy modele językowe i wizyjne, które rozumieją Twoje dane i klientów.',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-primary flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold mb-2">{item.title}</h4>
                    <p className="text-sm text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </SlideIn>

        </div>
      </div>
    </section>
  )
}
