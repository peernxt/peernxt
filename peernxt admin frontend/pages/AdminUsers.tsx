import React, { useEffect, useMemo, useState } from 'react';
import { Search, UserCog } from 'lucide-react';
import { User, UserRole } from '../types';
import { apiRequest } from '../lib/api';

const roleLabel: Record<UserRole, string> = {
  [UserRole.STUDENT]: 'Student',
  [UserRole.COUNSELOR]: 'Counselor',
  [UserRole.PEER_AMBASSADOR]: 'Ambassador',
  [UserRole.ADMIN]: 'Admin',
};

const roleBadge: Record<UserRole, string> = {
  [UserRole.STUDENT]: 'bg-indigo-50 text-indigo-600',
  [UserRole.COUNSELOR]: 'bg-blue-50 text-blue-600',
  [UserRole.PEER_AMBASSADOR]: 'bg-emerald-50 text-emerald-600',
  [UserRole.ADMIN]: 'bg-slate-100 text-slate-700',
};

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

  useEffect(() => {
    apiRequest<any[]>('/admin/users')
      .then((data) =>
        setUsers(
          (data ?? []).map((u) => ({
            id: String(u.id),
            name: String(u.displayName ?? u.display_name ?? 'User'),
            email: String(u.email ?? ''),
            role:
              String(u.role) === 'agent'
                ? UserRole.COUNSELOR
                : String(u.role) === 'ambassador'
                  ? UserRole.PEER_AMBASSADOR
                  : String(u.role) === 'admin'
                    ? UserRole.ADMIN
                    : UserRole.STUDENT,
          }))
        )
      )
      .catch(() => setUsers([]));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const matchQuery = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchQuery && matchRole;
    });
  }, [users, query, roleFilter]);

  const updateRole = (id: string, newRole: UserRole) => {
    const backendRole =
      newRole === UserRole.COUNSELOR ? 'agent' : newRole === UserRole.PEER_AMBASSADOR ? 'ambassador' : newRole;
    apiRequest(`/admin/users/${id}/role`, { method: 'PATCH', body: { role: backendRole } })
      .then(() => {
        setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: newRole } : u)));
      })
      .catch(() => undefined);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Users</h3>
            <p className="text-slate-500 text-sm mt-1">Search, filter, and update roles.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 w-full sm:w-72"
                placeholder="Search name or email"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300"
            >
              <option value="all">All roles</option>
              <option value={UserRole.STUDENT}>Students</option>
              <option value={UserRole.COUNSELOR}>Counselors</option>
              <option value={UserRole.PEER_AMBASSADOR}>Ambassadors</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">User</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Role</th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-slate-400">
                        <img src={`https://picsum.photos/seed/${u.id}/80/80`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate">{u.name}</p>
                        <p className="text-sm text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-xl text-xs font-bold ${roleBadge[u.role]}`}>
                      {roleLabel[u.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <div className="inline-flex items-center gap-2 text-slate-600 text-sm font-semibold">
                        <UserCog size={16} className="text-slate-400" />
                        Change role:
                      </div>
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value as UserRole)}
                        className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 text-sm font-semibold"
                      >
                        <option value={UserRole.STUDENT}>Student</option>
                        <option value={UserRole.COUNSELOR}>Counselor</option>
                        <option value={UserRole.PEER_AMBASSADOR}>Ambassador</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500 font-medium">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;

