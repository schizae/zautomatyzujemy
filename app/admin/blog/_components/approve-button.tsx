'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { approvePostAction } from '@/lib/actions/admin.actions'

interface ApproveButtonProps {
  postId: string
  postTitle: string
}

export function ApproveButton({ postId, postTitle }: ApproveButtonProps) {
  const [isPending, setIsPending] = useState(false)

  async function handleApprove() {
    if (!confirm(`Opublikować "${postTitle}"? Potwierdzasz, że tekst został sprawdzony.`)) return
    setIsPending(true)
    const result = await approvePostAction(postId)
    setIsPending(false)
    if (!result.success) alert(result.error)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleApprove}
      disabled={isPending}
      title="Zatwierdź i opublikuj"
      className="text-green-400 hover:bg-green-900/20 hover:text-green-400"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
    </Button>
  )
}
