'use client'

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteCaseStudyAction } from '@/lib/actions/admin.actions'

interface DeleteButtonProps {
  itemId: string
  itemTitle: string
}

export function DeleteButton({ itemId, itemTitle }: DeleteButtonProps) {
  const [isPending, setIsPending] = useState(false)

  async function handleDelete() {
    if (!confirm(`Usunąć realizację "${itemTitle}"? Tej operacji nie można cofnąć.`)) return
    setIsPending(true)
    await deleteCaseStudyAction(itemId)
    setIsPending(false)
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-400 hover:bg-red-50 hover:text-red-600"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
    </Button>
  )
}
