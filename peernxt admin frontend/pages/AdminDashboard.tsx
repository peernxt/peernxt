import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, BookOpen, ArrowRight, Activity, ExternalLink } from 'lucide-react';
import { useAuth } from '../App';
import { apiRequest } from '../lib/api';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [statsData, setStatsData] = useState({ users: 0, upcomingMeetings: 0, openSlots: 0 });
  const [nextItems, setNextItems] = useState<Array<{ id: string; title: string; subtitle: string; action: string; href: string }>>([]);
  const [recent, setRecent] = useState<Array<{ id: string; label: string; meta: string }>>([]);

  useEffect(() => {
    Promise.all([
      apiRequest<any>('/admin/stats').catch(() => ({ users: 0, upcomingMeetings: 0, openSlots: 0 })),
      apiRequest<any[]>('/admin/counselor-meetings').catch(() => []),
      apiRequest<any[]>('/admin/ambassador-slots').catch(() => []),
    ]).then(([stats, meetings, slots]) => {
      setStatsData(stats);
      setNextItems([
        ...meetings.slice(0, 1).map((m) => ({
          id: String(m.id),
          title: 'Counselor meeting',
          subtitle: `${String(m.agentId)} • ${new Date(String(m.slotAt)).toLocaleString()}`,
          action: 'Open',
          href: '/counselor-meetings',
        })),
        ...slots.slice(0, 1).map((s) => ({
          id: String(s.id),
          title: 'Ambassador slot',
          subtitle: `${String(s.ambassadorId)} • ${new Date(String(s.slotAt)).toLocaleString()}`,
          action: 'Review',
          href: '/ambassador-slots',
        })),
      ]);
      setRecent([
        { id: 'r1', label: `Active users: ${stats.users ?? 0}`, meta: 'Live stats' },
        { id: 'r2', label: `Upcoming meetings: ${stats.upcomingMeetings ?? 0}`, meta: 'Live stats' },
        { id: 'r3', label: `Open ambassador slots: ${stats.openSlots ?? 0}`, meta: 'Live stats' },
      ]);
    });
  }, []);

  const stats = [
    { name: 'Total Users', count: statsData.users, icon: Users, color: 'indigo', href: '/users' },
    { name: 'Upcoming Meetings', count: statsData.upcomingMeetings, icon: Calendar, color: 'blue', href: '/counselor-meetings' },
    { name: 'Open Ambassador Slots', count: statsData.openSlots, icon: BookOpen, color: 'emerald', href: '/ambassador-slots' },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome, {user?.name?.split(' ')[0] ?? 'Admin'}!
          </h1>
          <p className="text-indigo-100 text-lg mb-6 max-w-2xl">
            Monitor platform activity and manage users, meetings, ambassador slots, and events.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/users"
              className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-sm"
            >
              Manage Users <ArrowRight size={18} />
            </Link>
            <Link
              to="/events"
              className="bg-indigo-500/30 text-white backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-500/50 transition-colors"
            >
              Review Events
            </Link>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-white/10 rounded-full backdrop-blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-all"
          >
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.name}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{stat.count}</p>
            </div>
            <div className={`p-3 rounded-xl bg-${stat.color}-100 text-${stat.color}-600`}>
              <stat.icon size={28} />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Next Up</h2>
            <Link to="/counselor-meetings" className="text-indigo-600 text-sm font-bold hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {nextItems.map((it) => (
              <div key={it.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center text-slate-400 overflow-hidden">
                  <img src={`https://picsum.photos/seed/${it.id}/100/100`} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-900">{it.title}</h4>
                  <p className="text-slate-500 text-sm">{it.subtitle}</p>
                </div>
                <Link
                  to={it.href}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  {it.action} <ExternalLink size={14} />
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            <span className="text-slate-500 text-sm font-medium">Live</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Activity size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Admin activity feed</h4>
                <p className="text-slate-500 text-sm mt-1">
                  Recent platform stats and operational activity.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {recent.map((r) => (
                <div key={r.id} className="flex items-start gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-200 mt-2" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900">{r.label}</p>
                    <p className="text-sm text-slate-500">{r.meta}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;

