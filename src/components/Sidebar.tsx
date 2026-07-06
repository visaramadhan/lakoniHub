"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Settings, 
  Wallet, 
  History, 
  Award, 
  FileCheck,
  LogOut,
  Briefcase,
  UserPlus,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';
import Brand from '@/components/Brand';

interface SidebarProps {
  role: 'ADMIN' | 'CLIENT' | 'FREELANCER';
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = {
    ADMIN: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
      { name: 'Proyek', icon: FolderKanban, href: '/admin/projects' },
      { name: 'Freelancer', icon: Users, href: '/admin/freelancers' },
      { name: 'Ujian & Seleksi', icon: FileCheck, href: '/admin/tests' },
      { name: 'Master Data', icon: Settings, href: '/admin/master-data' },
      { name: 'Payout', icon: Wallet, href: '/admin/payouts' },
      { name: 'Log Aktivitas', icon: History, href: '/admin/activity' },
    ],
    CLIENT: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/client' },
      { name: 'Proyek Saya', icon: FolderKanban, href: '/client/projects' },
      { name: 'Tagihan', icon: Wallet, href: '/client/billing' },
    ],
    FREELANCER: [
      { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      { name: 'Cari Proyek', icon: Briefcase, href: '/projects' },
      { name: 'Proyek Saya', icon: FolderKanban, href: '/my-projects' },
      { name: 'Party Saya', icon: Users, href: '/party' },
      { name: 'Buat Party', icon: PlusCircle, href: '/party/create' },
      { name: 'Teman', icon: UserPlus, href: '/friends' },
      { name: 'Rank & Skill', icon: Award, href: '/profile/rank' },
      { name: 'Ujian', icon: FileCheck, href: '/tests' },
      { name: 'Penghasilan', icon: Wallet, href: '/earnings' },
    ],
  };

  const currentMenu = menuItems[role] || menuItems.FREELANCER;

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-2 border-b">
        <Brand href={role === 'ADMIN' ? '/admin' : role === 'CLIENT' ? '/client' : '/dashboard'} />
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
          Menu Utama
        </p>
        {currentMenu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === item.href 
                ? "bg-primary-light text-primary" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}
