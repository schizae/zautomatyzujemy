import { buildDisclosureText } from '@/lib/ai-disclosure'

interface AiDisclosureProps {
  aiGenerated: boolean
  reviewedAt: string | null
}

export function AiDisclosure({ aiGenerated, reviewedAt }: AiDisclosureProps) {
  const text = buildDisclosureText(aiGenerated, reviewedAt)
  if (!text) return null

  return (
    <p className="mt-12 border-t border-[#d9d6d0] pt-5 text-xs leading-relaxed text-[#86867f]">
      {text}
    </p>
  )
}
