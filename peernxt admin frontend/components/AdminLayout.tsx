import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  MessageSquare,
  Menu,
  X,
  LogOut,
  Shield,
} from 'lucide-react';

type NavItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

const navItems: NavItem[] = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'Users', icon: Users, path: '/users' },
  { name: 'Counselor Meetings', icon: Calendar, path: '/counselor-meetings' },
  { name: 'Ambassador Slots', icon: BookOpen, path: '/ambassador-slots' },
  { name: 'Events', icon: Calendar, path: '/events' },
  { name: 'Community', icon: MessageSquare, path: '/community' },
];

const routeTitleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'Users',
  '/counselor-meetings': 'Counselor Meetings',
  '/ambassador-slots': 'Ambassador Slots',
  '/events': 'Events',
  '/community': 'Community',
};

const getTitleFromPath = (pathname: string) => {
  const exact = routeTitleMap[pathname];
  if (exact) return exact;
  const match = Object.keys(routeTitleMap).find((p) => pathname.startsWith(p));
  return match ? routeTitleMap[match] : 'Admin';
};

const AdminLayout: React.FC<{ children: React.ReactNode; onLogout: () => void }> = ({ children, onLogout }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const title = getTitleFromPath(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <div className="md:hidden bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1 rounded text-white">
            <Shield size={20} />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">PeerNXT</span>
          <span className="ml-2 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      <aside
        className={`
          fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:inset-auto
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <Shield size={24} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">PeerNXT</span>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Admin</span>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-grow px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                    isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <item.icon
                    size={20}
                    className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-900'}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 space-y-1">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-grow flex flex-col min-w-0">
        <header className="hidden md:flex bg-white border-b border-slate-200 h-16 items-center justify-between px-8 sticky top-0 z-40">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl">Admin</span>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-7xl">{children}</main>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-[55] md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;

