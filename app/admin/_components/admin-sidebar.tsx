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
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-6 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-slate-800 to-blue-700">
          <Zap className="size-4 text-white" />
        </div>
        <span className="font-display text-sm font-bold text-slate-900">Admin Panel</span>
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
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-200 p-4">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="size-4" />
            Wyloguj się
          </button>
        </form>
      </div>
    </aside>
  )
}
