import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Search, ShieldAlert, Trash2, UserX, Users, MessageSquare, EyeOff, Flag } from 'lucide-react';
import { apiRequest } from '../lib/api';

type Group = {
  id: string;
  name: string;
  members: number;
  posts: number;
  status: 'active' | 'review';
};

type Post = {
  id: string;
  groupId: string;
  groupName: string;
  authorId: string;
  author: string;
  content: string;
  reports: number;
  createdAtLabel: string;
  hidden?: boolean;
  authorBanned?: boolean;
};

type Report = {
  id: string;
  postId: string;
  reason: string;
  reporter: string;
  createdAtLabel: string;
  status: 'open' | 'resolved';
};

const AdminCommunity: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const loadCommunityData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [groupsData, postsData, reportsData] = await Promise.all([
        apiRequest<Group[]>('/admin/community/groups'),
        apiRequest<Post[]>('/admin/community/posts'),
        apiRequest<Report[]>('/admin/community/reports'),
      ]);
      setGroups(groupsData ?? []);
      setPosts(postsData ?? []);
      setReports(reportsData ?? []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load community moderation data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, []);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchesQuery =
        !q ||
        p.author.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.groupName.toLowerCase().includes(q);
      const matchesGroup = groupFilter === 'all' || p.groupId === groupFilter;
      return matchesQuery && matchesGroup;
    });
  }, [posts, query, groupFilter]);

  const openReports = useMemo(() => reports.filter((r) => r.status === 'open'), [reports]);

  const hidePost = async (postId: string, hidden: boolean) => {
    setBusyKey(`post-${postId}`);
    try {
      await apiRequest(`/admin/community/posts/${postId}`, { method: 'PATCH', body: { hidden } });
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, hidden } : p)));
    } finally {
      setBusyKey(null);
    }
  };

  const removePost = async (postId: string) => {
    setBusyKey(`remove-${postId}`);
    try {
      await apiRequest(`/admin/community/posts/${postId}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setReports((prev) => prev.map((r) => (r.postId === postId ? { ...r, status: 'resolved' } : r)));
    } finally {
      setBusyKey(null);
    }
  };

  const warnUser = async (userId: string) => {
    setBusyKey(`warn-${userId}`);
    try {
      await apiRequest(`/admin/community/users/${userId}/warn`, { method: 'POST', body: { reason: 'Policy reminder from admin' } });
    } finally {
      setBusyKey(null);
    }
  };

  const toggleBan = async (userId: string, currentlyBanned: boolean) => {
    setBusyKey(`ban-${userId}`);
    try {
      await apiRequest(`/admin/community/users/${userId}/ban`, {
        method: 'PATCH',
        body: {
          banned: !currentlyBanned,
          reason: currentlyBanned ? 'Ban removed by admin' : 'Account restricted by admin',
        },
      });
      setPosts((prev) => prev.map((p) => (p.authorId === userId ? { ...p, authorBanned: !currentlyBanned } : p)));
    } finally {
      setBusyKey(null);
    }
  };

  const resolveReport = (reportId: string) => {
    setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r)));
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 text-sm font-semibold">{errorMessage}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
            <Users size={22} />
          </div>
          <p className="text-slate-500 text-sm font-semibold">Community Groups</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{groups.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
            <MessageSquare size={22} />
          </div>
          <p className="text-slate-500 text-sm font-semibold">Total Posts</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{posts.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
            <AlertTriangle size={22} />
          </div>
          <p className="text-slate-500 text-sm font-semibold">Open Reports</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{openReports.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Community Moderation</h3>
            <p className="text-slate-500 text-sm mt-1">Search posts, review reports, and take moderation actions.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search author, group, or content"
                className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 w-full sm:w-80"
              />
            </div>

            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300"
            >
              <option value="all">All groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 space-y-4">
          {isLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center text-slate-500 font-semibold">
              Loading community moderation data...
            </div>
          )}
          {filteredPosts.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">{p.groupName}</p>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{p.author}</h4>
                  <p className="text-xs text-slate-500 mt-1">{p.createdAtLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  {p.reports > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-bold">
                      <Flag size={12} /> {p.reports} reports
                    </span>
                  )}
                  {p.hidden && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold">
                      Hidden
                    </span>
                  )}
                </div>
              </div>
              <p className="text-slate-700 mt-4">{p.content}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => hidePost(p.id, !p.hidden)}
                  disabled={busyKey === `post-${p.id}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-50 text-slate-700 text-sm font-bold hover:bg-slate-100 transition-colors inline-flex items-center gap-2"
                >
                  <EyeOff size={15} /> {p.hidden ? 'Unhide' : 'Hide'}
                </button>
                <button
                  type="button"
                  onClick={() => removePost(p.id)}
                  disabled={busyKey === `remove-${p.id}`}
                  className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-colors inline-flex items-center gap-2"
                >
                  <Trash2 size={15} /> Remove
                </button>
                <button
                  type="button"
                  onClick={() => warnUser(p.authorId)}
                  disabled={busyKey === `warn-${p.authorId}`}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold hover:bg-amber-100 transition-colors inline-flex items-center gap-2"
                >
                  <ShieldAlert size={15} /> Warn
                </button>
                <button
                  type="button"
                  onClick={() => toggleBan(p.authorId, Boolean(p.authorBanned))}
                  disabled={busyKey === `ban-${p.authorId}`}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                >
                  <UserX size={15} /> {p.authorBanned ? 'Unban user' : 'Ban user'}
                </button>
              </div>
            </div>
          ))}
          {!isLoading && filteredPosts.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center text-slate-500 font-semibold">
              No posts match your filters.
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="font-bold text-slate-900 mb-3">Groups</h4>
            <div className="space-y-3">
              {groups.map((g) => (
                <div key={g.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{g.name}</p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
                        g.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {g.members} members • {g.posts} posts
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h4 className="font-bold text-slate-900 mb-3">Reported Queue</h4>
            <div className="space-y-3">
              {openReports.map((r) => (
                <div key={r.id} className="rounded-xl border border-red-100 bg-red-50/50 p-3">
                  <p className="text-sm font-bold text-slate-900">{r.reason}</p>
                  <p className="text-xs text-slate-500 mt-1">Reporter: {r.reporter}</p>
                  <p className="text-xs text-slate-500">{r.createdAtLabel}</p>
                  <button
                    type="button"
                    onClick={() => resolveReport(r.id)}
                    className="mt-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100"
                  >
                    Mark resolved
                  </button>
                </div>
              ))}
              {openReports.length === 0 && <p className="text-sm text-slate-500 font-medium">No open reports.</p>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminCommunity;

