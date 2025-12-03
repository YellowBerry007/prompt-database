"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FileText, Tag, FolderTree, Home } from "lucide-react"

const navigation = [
  { name: "Prompts", href: "/prompts", icon: FileText },
  { name: "Categories", href: "/categories", icon: FolderTree },
  { name: "Tags", href: "/tags", icon: Tag },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex w-64 flex-col border-r gradient-sidebar shadow-lg">
      <div className="flex h-16 items-center border-b border-purple-400/20 px-6">
        <Link href="/" className="flex items-center gap-2 text-white">
          <div className="rounded-lg bg-white/20 p-1.5">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Prompt DB</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white/20 text-white shadow-md backdrop-blur-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}


