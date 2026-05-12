
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../App';
import {
  IndianRupee,
  Clock,
  Video,
  CheckCircle,
  ArrowRight,
  MoreVertical,
  TrendingUp,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AmbassadorLayout from '../components/AmbassadorLayout';
import { apiRequest } from '../../lib/api';

const PeerAmbassadorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      apiRequest<any[]>('/ambassador-slots/slots/me?upcoming=true').catch(() => []),
      apiRequest<any[]>('/ambassador-slots/bookings/me').catch(() => []),
    ]).then(([slotRows, bookingRows]) => {
      setSlots(slotRows ?? []);
      setBookings(bookingRows ?? []);
    });
  }, []);

  const stats = [
    { name: 'Total Earnings', value: `₹${bookings.length * 1500}`, trend: 'estimated', icon: IndianRupee, color: 'emerald' },
    { name: 'Sessions', value: String(slots.length), trend: 'upcoming', icon: Video, color: 'blue' },
    { name: 'Avg. Rating', value: '4.8', trend: '42 reviews', icon: TrendingUp, color: 'indigo' },
    { name: 'Completed', value: String(bookings.length), trend: 'bookings', icon: CheckCircle, color: 'slate' },
  ];

  const sessions = useMemo(
    () =>
      slots.slice(0, 4).map((slot) => ({
        id: String(slot.id),
        student: String(slot.ambassadorId ?? 'Booked student'),
        time: new Date(String(slot.slotAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(String(slot.slotAt)).toLocaleDateString(),
        status: String(slot.status ?? 'SCHEDULED').toUpperCase(),
      })),
    [slots]
  );

  return (
    <AmbassadorLayout title="Peer Mentor Portal" subtitle={`Ready to help some juniors? You have ${sessions.length} upcoming sessions.`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className={`w-12 h-12 bg-${stat.color}-100 text-${stat.color}-600 rounded-2xl flex items-center justify-center mb-4`}>
              <stat.icon size={24} />
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.name}</p>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{stat.value}</h3>
            <p className="text-xs font-bold text-blue-600 mt-2 uppercase tracking-tight">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Upcoming Paid Sessions</h3>
              <Link to="/ambassador/sessions" className="text-blue-600 font-bold text-sm hover:underline">View all</Link>
            </div>
            <div className="divide-y divide-slate-50">
              {sessions.map((s) => (
                <div key={s.id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden">
                      <img src={`https://picsum.photos/seed/${s.id}/100/100`} alt="" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{s.student}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1">
                          <Clock size={12} /> {s.date}, {s.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/ambassador/sessions');
                      }}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                    >
                      Start Session
                    </button>
                    <button type="button" className="p-2 text-slate-400">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
              <Link to="/ambassador/earnings" className="text-blue-600 font-bold text-sm hover:underline">View Report</Link>
            </div>
            <div className="space-y-4">
              {[
                { student: 'Amit R.', amount: 1500, date: 'Oct 18', status: 'SETTLED' },
                { student: 'Sneha P.', amount: 1500, date: 'Oct 16', status: 'SETTLED' },
                { student: 'John D.', amount: 1500, date: 'Oct 12', status: 'SETTLED' },
              ].map((t, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100">
                      <TrendingUp size={18} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Payment from {t.student}</p>
                      <p className="text-xs text-slate-500 font-medium">{t.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">₹{t.amount}</p>
                    <p className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">{t.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Link to="/ambassador/availability" className="block">
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl hover:bg-slate-800 transition-colors">
              <h3 className="text-2xl font-bold mb-4">Availability</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Your next block of slots is opening on Monday. Make sure to sync your calendar.</p>
              <span className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                Manage Schedule <ArrowRight size={18} />
              </span>
              <div className="mt-8 pt-8 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Google Calendar</span>
                  <span className="text-emerald-500 text-[10px] font-bold uppercase px-2 py-0.5 bg-emerald-500/10 rounded-full">Connected</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  Auto-generating Meet links
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </AmbassadorLayout>
  );
};

export default PeerAmbassadorDashboard;
