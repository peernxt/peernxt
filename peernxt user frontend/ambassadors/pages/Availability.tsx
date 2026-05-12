import React, { useEffect, useMemo, useState } from 'react';
import AmbassadorLayout from '../components/AmbassadorLayout';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { apiRequest } from '../../lib/api';

const AmbassadorAvailability: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>('');

  const days = [
    { key: 'mon', label: 'Monday' },
    { key: 'tue', label: 'Tuesday' },
    { key: 'wed', label: 'Wednesday' },
    { key: 'thu', label: 'Thursday' },
    { key: 'fri', label: 'Friday' },
    { key: 'sat', label: 'Saturday' },
  ];

  const [slotRows, setSlotRows] = useState<any[]>([]);
  const slotsByDay = useMemo(() => {
    return slotRows.reduce<Record<string, any[]>>((acc, slot) => {
      const day = new Date(String(slot.slotAt)).toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase().slice(0, 3);
      if (!acc[day]) acc[day] = [];
      acc[day].push(slot);
      return acc;
    }, {});
  }, [slotRows]);
  const slots = selectedDay ? slotsByDay[selectedDay] || [] : [];

  useEffect(() => {
    apiRequest<any[]>('/ambassador-slots/slots/me?upcoming=true')
      .then((data) => setSlotRows(data ?? []))
      .catch(() => setSlotRows([]));
  }, []);

  const removeSlot = (slotIdx: number) => {
    if (!selectedDay) return;
    const slot = slots[slotIdx];
    if (!slot?.id) return;
    apiRequest(`/ambassador-slots/slots/${slot.id}`, { method: 'DELETE' })
      .then(() => setSlotRows((prev) => prev.filter((s) => s.id !== slot.id)))
      .catch(() => undefined);
  };

  const addSlot = () => {
    if (!selectedDay) return;
    const value = window.prompt('Add a slot (e.g. 18:00 - 19:00)');
    const slot = value?.trim();
    if (!slot) return;
    const [start] = slot.split('-').map((s) => s.trim());
    const dayLabel = days.find((d) => d.key === selectedDay)?.label ?? 'Monday';
    const dt = new Date();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    while (weekdays[dt.getDay()] !== dayLabel) dt.setDate(dt.getDate() + 1);
    const [hh, mm] = start.split(':').map((v) => Number(v));
    dt.setHours(hh || 10, mm || 0, 0, 0);
    apiRequest<any>('/ambassador-slots/slots', {
      method: 'POST',
      body: { slotAt: dt.toISOString(), durationMinutes: 60 },
    })
      .then((created) => setSlotRows((prev) => [created, ...prev]))
      .catch(() => undefined);
  };

  return (
    <AmbassadorLayout title="Availability" subtitle="Set when students can book paid peer sessions with you.">
      <div className="space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Calendar size={22} className="text-blue-600" />
            Weekly Schedule
          </h3>
          <p className="text-slate-500 mb-6">Select a day to view or edit your available slots. Students will see these when booking a peer session.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
            {days.map((d) => (
              <button
                key={d.key}
                onClick={() => setSelectedDay(d.key)}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  selectedDay === d.key
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                }`}
              >
                <span className="block text-sm font-bold">{d.label}</span>
                <span className="block text-xs mt-1 opacity-80">
                  {(slotsByDay[d.key]?.length ?? 0)} slots
                </span>
              </button>
            ))}
          </div>

          {selectedDay && (
            <div className="border-t border-slate-100 pt-8">
              <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                {days.find((d) => d.key === selectedDay)?.label} – Time Slots
              </h4>
              <div className="space-y-3">
                {slots.map((slot, idx) => (
                  <div
                    key={slot.id ?? idx}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                  >
                    <span className="font-semibold text-slate-700">
                      {new Date(String(slot.slotAt)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSlot(idx)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Remove slot"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSlot}
                  className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:border-blue-300 hover:text-blue-600 font-semibold transition-all"
                >
                  <Plus size={20} /> Add slot
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Your availability can sync with Google Calendar when connected. Students will only see slots that don’t conflict with your schedule.
          </p>
        </div>
      </div>
    </AmbassadorLayout>
  );
};

export default AmbassadorAvailability;
