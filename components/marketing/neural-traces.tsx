'use client'

import { motion } from 'framer-motion'

const circuits = [
  'M0 160 H70 L110 200 V320 L150 360 H210',
  'M600 100 H530 L490 140 V260 L450 300 H410',
  'M600 460 H540 L500 500 V560 H380',
  'M0 520 H60 L100 480 V420 H160',
]

export function NeuralTraces({ moving }: { moving: boolean }) {
  return <svg aria-hidden="true" viewBox="0 0 600 700" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 -z-10 h-full w-full">
    {circuits.map((path, index) => <g key={path}>
      <path d={path} fill="none" stroke="#f5f2ed" strokeOpacity=".12" strokeWidth="1" />
      <motion.path d={path} fill="none" stroke="#f34c30" strokeWidth="2" strokeLinecap="round" strokeDasharray="24 600" initial={false} animate={moving ? { strokeDashoffset: [624, 0], opacity: [.15, .75, .15] } : { opacity: 0 }} transition={{ duration: moving ? 5 + index : 0, delay: moving ? index * .4 : 0, repeat: moving ? Infinity : 0, ease: 'linear' }} />
    </g>)}
    {[[110, 200], [490, 260], [500, 500], [100, 480]].map(([x, y], index) => <motion.circle key={index} cx={x} cy={y} r="3" fill="#f34c30" initial={false} animate={moving ? { opacity: [.15, .8, .15], r: [2, 4, 2] } : { opacity: .2, r: 2 }} transition={{ duration: moving ? 4 : 0, repeat: moving ? Infinity : 0, delay: moving ? index * .7 : 0 }} />)}
  </svg>
}
