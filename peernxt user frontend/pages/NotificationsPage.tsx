
import React from 'react';
import StudentLayout from '../students/components/StudentLayout';
import { useAuth } from '../App';
import { UserRole } from '../types';
import { Bell, CheckCircle, Calendar, MessageSquare, Clock } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();

  const [notifications, setNotifications] = React.useState([
    { id: '1', title: 'Meeting Confirmed', body: 'Dr. Sarah Wilson has confirmed your session for tomorrow at 10:30 AM.', type: 'meeting', time: '10 mins ago', read: false },
    { id: '2', title: 'New Comment', body: 'Someone commented on your post in "USA Fall 2024".', type: 'community', time: '2 hours ago', read: false },
    { id: '3', title: 'Session Reminder', body: 'Don\'t forget your peer mentoring session with Rahul today!', type: 'session', time: '5 hours ago', read: true },
    { id: '4', title: 'Welcome to PeerNXT', body: 'Thanks for joining! Complete your profile to get the best recommendations.', type: 'system', time: 'Yesterday', read: true },
  ]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Calendar className="text-indigo-600" />;
      case 'community': return <MessageSquare className="text-emerald-600" />;
      case 'session': return <CheckCircle className="text-blue-600" />;
      default: return <Bell className="text-slate-400" />;
    }
  };

  // Fix: Move the notification content to a separate variable to avoid nested component errors
  const content = (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
         <h1 className="text-2xl font-bold text-slate-900">Your Notifications</h1>
         <button
           type="button"
           onClick={() => {
             setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
             alert('All notifications marked as read (mock).');
           }}
           className="text-indigo-600 text-sm font-bold hover:underline"
         >
           Mark all as read
         </button>
      </div>

      <div className="space-y-4">
        {notifications.map(n => (
          <div key={n.id} className={`p-5 rounded-2xl border transition-all flex gap-4 ${n.read ? 'bg-white border-slate-100' : 'bg-indigo-50/50 border-indigo-100 shadow-sm shadow-indigo-100/20'}`}>
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${n.read ? 'bg-slate-100' : 'bg-white shadow-sm'}`}>
               {getIcon(n.type)}
             </div>
             <div className="flex-grow">
               <div className="flex items-start justify-between mb-1">
                 <h3 className={`text-sm font-bold ${n.read ? 'text-slate-700' : 'text-indigo-950'}`}>{n.title}</h3>
                 <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                   <Clock size={10} /> {n.time}
                 </span>
               </div>
               <p className={`text-sm leading-relaxed ${n.read ? 'text-slate-500' : 'text-slate-700'}`}>{n.body}</p>
             </div>
             {!n.read && (
               <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
             )}
          </div>
        ))}
      </div>
    </div>
  );

  // Fix: Use conditional rendering based on user role instead of a nested PageWrapper component
  if (user?.role === UserRole.STUDENT) {
    return <StudentLayout title="Notifications">{content}</StudentLayout>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {content}
    </div>
  );
};

export default NotificationsPage;
