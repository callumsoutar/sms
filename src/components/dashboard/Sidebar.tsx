'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart, 
  AlertTriangle, 
  FileText, 
  Search, 
  Users, 
  Settings, 
  PlaneTakeoff,
  ClipboardList,
  LogOut,
  Truck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart },
  { name: 'Occurrences', href: '/dashboard/occurrences', icon: AlertTriangle },
  { name: 'Investigations', href: '/dashboard/investigations', icon: Search },
  { name: 'Aircraft', href: '/dashboard/aircraft', icon: PlaneTakeoff },
  { name: 'Trailers', href: '/dashboard/trailers', icon: Truck },
  { name: 'Corrective Actions', href: '/dashboard/actions', icon: ClipboardList },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/sign-in');
  };

  return (
    <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:z-10 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="bg-blue-600 text-white p-2 rounded-lg mr-2">
              <PlaneTakeoff className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Aviation SMS</h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
          <nav className="mt-2 flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
                    ${isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                  `}
                >
                  <item.icon 
                    className={`
                      mr-3 flex-shrink-0 h-5 w-5
                      ${isActive 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'}
                    `}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200 ease-in-out"
          >
            <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-gray-500 dark:text-gray-400" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
} 