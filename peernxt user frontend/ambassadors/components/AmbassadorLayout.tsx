import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import {
  Users,
  Calendar,
  Video,
  IndianRupee,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';

interface AmbassadorLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AmbassadorLayout: React.FC<AmbassadorLayoutProps> = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/ambassador/dashboard' },
    { icon: Calendar, label: 'Availability', path: '/ambassador/availability' },
    { icon: Video, label: 'Sessions', path: '/ambassador/sessions' },
    { icon: IndianRupee, label: 'Earnings', path: '/ambassador/earnings' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-20 md:w-64 bg-slate-900 flex flex-col items-center py-8">
        <Link to="/ambassador/dashboard" className="mb-12 flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Users size={24} />
          </div>
          <span className="hidden md:block text-xl font-bold text-white">Peer Hub</span>
        </Link>

        <nav className="flex-grow w-full px-2 md:px-4 space-y-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`w-full flex items-center justify-center md:justify-start gap-3 p-3 rounded-xl transition-all ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon size={22} />
                <span className="hidden md:block font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto w-full flex items-center justify-center md:justify-start gap-3 p-3 text-red-400 hover:bg-red-500/10 transition-all rounded-xl px-2 md:px-4"
        >
          <LogOut size={22} />
          <span className="hidden md:block font-semibold">Logout</span>
        </button>
      </aside>

      <main className="flex-grow p-4 md:p-10 max-w-7xl">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{title}</h1>
            {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 overflow-hidden border border-white shadow-sm">
              <img src={`https://picsum.photos/seed/${user?.id}/150/150`} alt="" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
};

export default AmbassadorLayout;
