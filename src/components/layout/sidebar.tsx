"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  Clock,
  List,
  FileText,
  Radio,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Map },
  { href: "/dashboard/timeline", label: "Timeline", icon: Clock },
  { href: "/dashboard/events", label: "Events", icon: List },
  { href: "/dashboard/briefs", label: "Intel Briefs", icon: FileText },
  { href: "/dashboard/sources", label: "Sources", icon: Radio },
  { href: "/dashboard/alerts", label: "Alerts", icon: AlertTriangle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[240px] min-h-screen bg-[#111827] border-r border-[#1e293b] flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-[#1e293b]">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#f97316]" />
          <span className="text-lg font-bold tracking-wider text-white">
            MERIDIAN
          </span>
        </Link>
        <p className="text-[10px] text-[#94a3b8] mt-1 tracking-widest uppercase">
          OSINT Intelligence
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#f97316]/10 text-[#f97316]"
                  : "text-[#94a3b8] hover:text-white hover:bg-[#1e293b]"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-[#1e293b]">
        <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
          System Active
        </div>
      </div>
    </aside>
  );
}
