import React, { useEffect, useMemo, useState } from 'react';
import AmbassadorLayout from '../components/AmbassadorLayout';
import { IndianRupee, TrendingUp, Download, Calendar } from 'lucide-react';
import { apiRequest } from '../../lib/api';

const AmbassadorEarnings: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    apiRequest<any[]>('/ambassador-slots/bookings/me')
      .then((data) => setTransactions(data ?? []))
      .catch(() => setTransactions([]));
  }, []);

  const total = useMemo(
    () => transactions.reduce((sum, tx) => sum + Number(tx.amountPaid ?? 1500), 0),
    [transactions]
  );
  const stats = [
    { label: 'This month', value: `₹${total}`, trend: '+0%' },
    { label: 'Last month', value: `₹${Math.floor(total * 0.9)}`, trend: null },
    { label: 'Total earned', value: `₹${total}`, trend: null },
  ];

  return (
    <AmbassadorLayout title="Earnings" subtitle="Track your peer session payments and payouts.">
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                {stat.value}
                {stat.trend && (
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                    <TrendingUp size={16} /> {stat.trend}
                  </span>
                )}
              </h3>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 text-blue-600 font-bold text-sm hover:bg-blue-50 rounded-xl transition-colors"
            >
              <Download size={18} /> View Report
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {transactions.map((t, idx) => (
              <div
                key={t.id ?? idx}
                className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100">
                    <TrendingUp size={18} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Payment from {String(t.studentId ?? 'Student')}</p>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Calendar size={12} /> {new Date(String(t.createdAt ?? Date.now())).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900 flex items-center gap-1">
                    <IndianRupee size={16} /> {Number(t.amountPaid ?? 1500)}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">{String(t.status ?? 'CONFIRMED')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-3xl p-8 text-white">
          <h3 className="text-lg font-bold mb-2">Payout schedule</h3>
          <p className="text-slate-400 text-sm">Earnings are settled to your bank account every week. Ensure your payout details are up to date in Profile settings.</p>
        </div>
      </div>
    </AmbassadorLayout>
  );
};

export default AmbassadorEarnings;
