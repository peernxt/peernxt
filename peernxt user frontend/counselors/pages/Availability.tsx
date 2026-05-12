import React, { useEffect, useMemo, useState } from 'react';
import CounselorLayout from '../components/CounselorLayout';
import { Calendar, Clock } from 'lucide-react';
import { apiRequest } from '../../lib/api';

const CounselorAvailability: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [meetings, setMeetings] = useState<any[]>([]);

  const days = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
  ];

  useEffect(() => {
    apiRequest<any[]>('/counselor-meetings/me')
      .then((data) => setMeetings(data ?? []))
      .catch(() => setMeetings([]));
  }, []);

  const slotsByDay = useMemo(() => {
    return meetings.reduce<Record<string, string[]>>((acc, meeting) => {
      const dt = new Date(String(meeting.slotAt));
      const key = dt.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
      if (!acc[key]) acc[key] = [];
      acc[key].push(
        `${dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${String(meeting.status).toUpperCase()}`
      );
      return acc;
    }, {});
  }, [meetings]);
  const slots = selectedDay ? slotsByDay[selectedDay] || [] : [];

  return (
    <CounselorLayout title="My Availability" subtitle="Set when students can book sessions with you.">
      <div className="space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar size={22} className="text-indigo-600" />
            Weekly Schedule
          </h3>
          <p className="text-slate-500 mb-6">Select a day to view or edit your available slots. These slots will appear to students when they book a session.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {days.map((d) => (
              <button
                key={d.key}
                onClick={() => setSelectedDay(d.key)}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  selectedDay === d.key
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                }`}
              >
                <span className="block text-sm font-bold">{d.label}</span>
                <span className="block text-xs mt-1 opacity-80">
                  {slotsByDay[d.key]?.length ?? 0} slots
                </span>
              </button>
            ))}
          </div>

          {selectedDay && (
            <div className="border-t border-slate-100 pt-8">
              <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-indigo-600" />
                {days.find((d) => d.key === selectedDay)?.label} – Time Slots
              </h4>
              <div className="space-y-3">
                {slots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <span className="font-semibold text-slate-700">{slot}</span>
                  </div>
                ))}
                {slots.length === 0 && (
                  <div className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-center font-semibold">
                    No meetings for this day
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="bg-indigo-50 rounded-3xl p-6 border border-indigo-100">
          <p className="text-sm text-indigo-800">
            <strong>Tip:</strong> Your availability syncs with Google Calendar when connected. Students will only see slots that don’t conflict with your calendar.
          </p>
        </div>
      </div>
    </CounselorLayout>
  );
};

export default CounselorAvailability;
