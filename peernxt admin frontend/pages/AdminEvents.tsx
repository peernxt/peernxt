import React, { useMemo, useState, useEffect } from 'react';
import { Calendar, Filter, Users, XCircle, Pencil, Plus } from 'lucide-react';
import { Event } from '../types';
import { apiRequest } from '../lib/api';

const statusBadge: Record<Event['status'], string> = {
  upcoming: 'bg-indigo-50 text-indigo-600',
  completed: 'bg-emerald-50 text-emerald-600',
  cancelled: 'bg-red-50 text-red-600',
};

type AdminEvent = Event & {
  agentId: string;
  description: string;
  startAt: string;
  endAt: string;
  locationType: 'online' | 'offline';
  locationDetails?: string;
  meetLink?: string;
  maxAttendees?: number;
};

type EventFormState = {
  id?: string;
  title: string;
  description: string;
  agentId: string;
  startAt: string;
  endAt: string;
  locationType: 'online' | 'offline';
  locationDetails: string;
  meetLink: string;
  maxAttendees: string;
};

const emptyForm: EventFormState = {
  title: '',
  description: '',
  agentId: '',
  startAt: '',
  endAt: '',
  locationType: 'online',
  locationDetails: '',
  meetLink: '',
  maxAttendees: '',
};

const toLocalDateTimeValue = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [agents, setAgents] = useState<Array<{ id: string; name: string }>>([]);
  const [status, setStatus] = useState<Event['status'] | 'all'>('all');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [form, setForm] = useState<EventFormState>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([apiRequest<any[]>('/admin/events').catch(() => []), apiRequest<any[]>('/admin/users?role=agent').catch(() => [])]).then(
      ([eventsData, usersData]) => {
        setAgents(
          (usersData ?? []).map((u) => ({
            id: String(u.id),
            name: String(u.displayName ?? u.display_name ?? u.email ?? u.id),
          }))
        );
        setEvents(
          (eventsData ?? []).map((e) => {
            const startAt = String(e.startAt);
            const endAt = String(e.endAt);
            const start = new Date(startAt);
            const end = new Date(endAt);
            const now = Date.now();
            return {
              id: String(e.id),
              title: String(e.title),
              hostName: String(e.agentId),
              startsAtLabel: start.toLocaleString(),
              endsAtLabel: end.toLocaleString(),
              status: now < end.getTime() ? 'upcoming' : 'completed',
              rsvpCount: Number(e.rsvpCount ?? 0),
              agentId: String(e.agentId),
              description: String(e.description ?? ''),
              startAt,
              endAt,
              locationType: String(e.locationType ?? 'online') === 'offline' ? 'offline' : 'online',
              locationDetails: e.locationDetails ? String(e.locationDetails) : '',
              meetLink: e.meetLink ? String(e.meetLink) : '',
              maxAttendees: e.maxAttendees ? Number(e.maxAttendees) : undefined,
            } as AdminEvent;
          })
        );
      }
    );
  }, []);

  const filtered = useMemo(() => {
    return events.filter((e) => status === 'all' || e.status === status);
  }, [events, status]);

  const openCreateForm = () => {
    setFormMode('create');
    setFormError(null);
    setForm({ ...emptyForm, agentId: agents[0]?.id ?? '' });
  };

  const openEditForm = (event: AdminEvent) => {
    setFormMode('edit');
    setFormError(null);
    setForm({
      id: event.id,
      title: event.title,
      description: event.description,
      agentId: event.agentId,
      startAt: toLocalDateTimeValue(event.startAt),
      endAt: toLocalDateTimeValue(event.endAt),
      locationType: event.locationType,
      locationDetails: event.locationDetails ?? '',
      meetLink: event.meetLink ?? '',
      maxAttendees: event.maxAttendees ? String(event.maxAttendees) : '',
    });
  };

  const closeForm = () => {
    setFormMode(null);
    setFormError(null);
    setForm(emptyForm);
  };

  const submitForm = async () => {
    if (!form.title.trim() || !form.agentId || !form.startAt || !form.endAt) {
      setFormError('Title, host, start time, and end time are required.');
      return;
    }
    if (new Date(form.startAt).getTime() > new Date(form.endAt).getTime()) {
      setFormError('Start time must be before end time.');
      return;
    }
    setIsSaving(true);
    setFormError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        agentId: form.agentId,
        startAt: new Date(form.startAt).toISOString(),
        endAt: new Date(form.endAt).toISOString(),
        locationType: form.locationType,
        locationDetails: form.locationDetails.trim() || undefined,
        meetLink: form.meetLink.trim() || undefined,
        maxAttendees: form.maxAttendees.trim() ? Number(form.maxAttendees) : undefined,
      };
      if (formMode === 'edit' && form.id) {
        await apiRequest(`/admin/events/${form.id}`, { method: 'PATCH', body: payload });
      } else {
        await apiRequest('/admin/events', { method: 'POST', body: payload });
      }
      const refreshed = await apiRequest<any[]>('/admin/events');
      setEvents(
        (refreshed ?? []).map((e) => {
          const startAt = String(e.startAt);
          const endAt = String(e.endAt);
          const start = new Date(startAt);
          const end = new Date(endAt);
          const now = Date.now();
          return {
            id: String(e.id),
            title: String(e.title),
            hostName: String(e.agentId),
            startsAtLabel: start.toLocaleString(),
            endsAtLabel: end.toLocaleString(),
            status: now < end.getTime() ? 'upcoming' : 'completed',
            rsvpCount: Number(e.rsvpCount ?? 0),
            agentId: String(e.agentId),
            description: String(e.description ?? ''),
            startAt,
            endAt,
            locationType: String(e.locationType ?? 'online') === 'offline' ? 'offline' : 'online',
            locationDetails: e.locationDetails ? String(e.locationDetails) : '',
            meetLink: e.meetLink ? String(e.meetLink) : '',
            maxAttendees: e.maxAttendees ? Number(e.maxAttendees) : undefined,
          } as AdminEvent;
        })
      );
      closeForm();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save event.');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEvent = (id: string) => {
    apiRequest(`/admin/events/${id}`, { method: 'DELETE' })
      .then(() => setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'cancelled' } : e))))
      .catch(() => undefined);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Events</h3>
            <p className="text-slate-500 text-sm mt-1">Create, edit, and review events and RSVPs.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-colors"
            >
              <Plus size={16} /> Create event
            </button>
            <div className="inline-flex items-center gap-2 text-slate-600 text-sm font-semibold">
              <Filter size={16} className="text-slate-400" />
              Status
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300"
            >
              <option value="all">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {formMode && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h4 className="text-lg font-bold text-slate-900">{formMode === 'create' ? 'Create Event' : 'Edit Event'}</h4>
          {formError && <p className="text-sm font-semibold text-red-600">{formError}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Event title"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
            <select
              value={form.agentId}
              onChange={(e) => setForm((prev) => ({ ...prev, agentId: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              <option value="">Select host counselor</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => setForm((prev) => ({ ...prev, startAt: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => setForm((prev) => ({ ...prev, endAt: e.target.value }))}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
            <select
              value={form.locationType}
              onChange={(e) => setForm((prev) => ({ ...prev, locationType: e.target.value as 'online' | 'offline' }))}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
            <input
              value={form.maxAttendees}
              onChange={(e) => setForm((prev) => ({ ...prev, maxAttendees: e.target.value }))}
              placeholder="Max attendees (optional)"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            />
            <input
              value={form.locationDetails}
              onChange={(e) => setForm((prev) => ({ ...prev, locationDetails: e.target.value }))}
              placeholder="Location details (optional)"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 md:col-span-2"
            />
            <input
              value={form.meetLink}
              onChange={(e) => setForm((prev) => ({ ...prev, meetLink: e.target.value }))}
              placeholder="Meet link (optional)"
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 md:col-span-2"
            />
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Description"
              rows={4}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 md:col-span-2"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={submitForm}
              disabled={isSaving}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold ${
                isSaving ? 'bg-slate-200 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {isSaving ? 'Saving...' : formMode === 'create' ? 'Create Event' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map((e) => (
          <div key={e.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{e.title}</p>
                  <p className="text-slate-500 text-sm truncate">
                    Host: {e.hostName} • {e.startsAtLabel} – {e.endsAtLabel}
                  </p>
                </div>
              </div>
              <span className={`inline-flex px-3 py-1 rounded-xl text-xs font-bold ${statusBadge[e.status]}`}>
                {e.status.toUpperCase()}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <div className="inline-flex items-center gap-2 text-slate-600 font-semibold">
                <Users size={18} className="text-slate-400" />
                {e.rsvpCount} RSVPs
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditForm(e)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-colors bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  onClick={() => cancelEvent(e.id)}
                  disabled={e.status !== 'upcoming'}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                    e.status === 'upcoming'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <XCircle size={16} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm text-center text-slate-500 font-medium lg:col-span-2">
            No events found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;

