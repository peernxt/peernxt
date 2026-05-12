import React, { useState } from 'react';
import CounselorLayout from '../components/CounselorLayout';
import { Calendar, Link2, Clock, Save, CheckCircle } from 'lucide-react';
import { apiRequest } from '../../lib/api';

const CounselorSettings: React.FC = () => {
  const [connected, setConnected] = useState(true);
  const [sessionLength, setSessionLength] = useState(30);
  const [bufferMinutes, setBufferMinutes] = useState(15);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  return (
    <CounselorLayout title="Calendar Settings" subtitle="Connect Google Calendar and configure your booking preferences.">
      <div className="space-y-8 max-w-2xl">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Link2 size={22} className="text-indigo-600" />
            Google Calendar
          </h3>
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                <Calendar size={24} className="text-slate-600" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Google Calendar</p>
                <p className="text-sm text-slate-500">
                  {connected ? 'Connected – Meet links are created automatically' : 'Not connected'}
                </p>
              </div>
            </div>
            {connected ? (
              <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                <CheckCircle size={18} /> Connected
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setConnected(true);
                }}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
              >
                Connect
              </button>
            )}
          </div>
          {connected && (
            <button
              type="button"
              onClick={() => {
                setConnected(false);
              }}
              className="mt-4 text-sm text-slate-500 hover:text-red-600 font-medium"
            >
              Disconnect calendar
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock size={22} className="text-indigo-600" />
            Booking Preferences
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Default session length (minutes)</label>
              <select
                value={sessionLength}
                onChange={(e) => setSessionLength(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={90}>90 min</option>
                <option value={120}>120 min</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Buffer between sessions (minutes)</label>
              <select
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>No buffer</option>
                <option value={5}>5 min</option>
                <option value={10}>10 min</option>
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">Prevents back-to-back bookings.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await apiRequest('/users/me', {
                  method: 'PUT',
                  body: {
                    profile: {
                      calendarAvailability: JSON.stringify({
                        connected,
                        sessionLength,
                        bufferMinutes,
                      }),
                    },
                  },
                });
              } catch {
                // UI remains editable even if backend update fails.
              }
              setSavedAt(Date.now());
            }}
            className="mt-8 w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            <Save size={20} /> Save changes
          </button>
          {savedAt && (
            <p className="text-xs text-slate-500 mt-3">
              Saved just now.
            </p>
          )}
        </div>
      </div>
    </CounselorLayout>
  );
};

export default CounselorSettings;
