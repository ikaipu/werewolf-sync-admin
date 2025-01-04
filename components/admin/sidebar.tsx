import Link from 'next/link'
import { Home, Bell, Settings, PenToolIcon as Tool } from 'lucide-react'

const navItems = [
  { href: '/admin', icon: Home, label: 'ダッシュボード' },
  { href: '/admin/announcements', icon: Bell, label: 'お知らせ管理' },
  { href: '/admin/maintenance', icon: Tool, label: 'メンテナンス管理' },
  { href: '/admin/settings', icon: Settings, label: '設定' },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-6">
        <h1 className="text-2xl font-bold">人狼ゲーム管理</h1>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

