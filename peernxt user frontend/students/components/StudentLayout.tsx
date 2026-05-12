import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  MessageSquare,
  Calendar,
  Bell,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  ChevronRight,
  Video
} from 'lucide-react';

interface StudentLayoutProps {
  children: React.ReactNode;
  title: string;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
    { name: 'Counselors', icon: UserCheck, path: '/student/counselors' },
    { name: 'Peer Mentors', icon: Users, path: '/student/ambassadors' },
    { name: 'Peer Sessions', icon: Video, path: '/student/peer-sessions' },
    { name: 'Community', icon: MessageSquare, path: '/student/community' },
    { name: 'My Schedule', icon: Calendar, path: '/student/meetings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <div className="md:hidden bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1 rounded text-white"><LayoutDashboard size={20} /></div>
          <span className="font-bold text-slate-900 tracking-tight">PeerNXT</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg">
          <Menu size={24} />
        </button>
      </div>

      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-auto
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                <LayoutDashboard size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">PeerNXT</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <div className="px-6 pb-6">
            <Link to="/profile" className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 overflow-hidden">
                {user?.profilePicture ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" /> : <UserIcon size={20} />}
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </Link>
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
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-900'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 space-y-1">
            <Link to="/notifications" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all">
              <Bell size={20} />
              Notifications
            </Link>
            <button
              onClick={handleLogout}
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
          <div className="flex items-center gap-4">
            <Link to="/notifications" className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Link>
            <Link to="/profile" className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user?.name ?? 'User'} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={16} />
              )}
            </Link>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-7xl">
          {children}
        </main>
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

export default StudentLayout;
