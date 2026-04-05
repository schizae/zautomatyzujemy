'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Layers, LogOut, Zap, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { logoutAction } from '@/lib/actions/admin.actions'

const navItems = [
  { href: '/admin/blog', label: 'Blog', icon: FileText },
  { href: '/admin/case-studies', label: 'Case Study', icon: Trophy },
  { href: '/admin/content', label: 'Treść strony', icon: Layers },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-outline-variant bg-surface-container-low">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-outline-variant px-6 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/80 to-primary">
          <Zap className="size-4 text-on-primary" />
        </div>
        <span className="font-headline text-sm font-bold text-on-surface">Admin Panel</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-primary/10 text-primary'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-outline-variant p-4">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:bg-red-900/20 hover:text-red-400"
          >
            <LogOut className="size-4" />
            Wyloguj się
          </button>
        </form>
      </div>
    </aside>
  )
}
