
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StudentLayout from '../components/StudentLayout';
import { 
  ArrowLeft, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  MoreHorizontal, 
  Send, 
  Image as ImageIcon,
  Flag
} from 'lucide-react';

const CommunityFeed: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState(() => ([
    { 
      id: 'p1', 
      author: 'Aarav Gupta', 
      time: '2 hours ago', 
      content: 'Just received my UK student visa! The process took exactly 15 working days. Highly recommend starting the financial document collection early.',
      likes: 24,
      comments: 5,
      isLiked: true as boolean
    },
    { 
      id: 'p2', 
      author: 'Sneha Rao', 
      time: '5 hours ago', 
      content: 'Anyone else heading to University of Manchester for Fall 24? Looking for flatmates near Oxford Road.',
      likes: 12,
      comments: 18,
      isLiked: false as boolean,
      image: 'https://picsum.photos/seed/manchester/600/300'
    },
    { 
      id: 'p3', 
      author: 'Priyanshu K.', 
      time: 'Yesterday', 
      content: 'Pro-tip for first-timers: Get a Monzo/Revolut account as soon as you land. Makes local payments so much easier.',
      likes: 45,
      comments: 8,
      isLiked: false as boolean
    }
  ]));

  const handleCreatePost = () => {
    const content = newPost.trim();
    if (!content) return;
    const created = {
      id: `p${Date.now()}`,
      author: 'You',
      time: 'Just now',
      content,
      likes: 0,
      comments: 0,
      isLiked: false as boolean,
    };
    setPosts((prev) => [created, ...prev]);
    setNewPost('');
  };

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const nextLiked = !p.isLiked;
        return { ...p, isLiked: nextLiked, likes: Math.max(0, p.likes + (nextLiked ? 1 : -1)) };
      })
    );
  };

  const handleShare = async (postId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/student/community/${id}?post=${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Post link copied to clipboard.');
    } catch {
      alert('Could not copy link. Your browser may block clipboard access.');
    }
  };

  return (
    <StudentLayout title="Community Feed">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/student/community" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold mb-2">
          <ArrowLeft size={18} /> Back to Communities
        </Link>

        {/* Create Post */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0"></div>
             <div className="flex-grow">
               <textarea 
                 value={newPost}
                 onChange={(e) => setNewPost(e.target.value)}
                 placeholder="Share your journey, ask a question, or find flatmates..."
                 className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24 mb-4"
               />
               <div className="flex items-center justify-between">
                 <button
                   type="button"
                   onClick={() => alert('Photo upload is coming soon.')}
                   className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors"
                 >
                   <ImageIcon size={20} /> <span className="text-sm">Add Photos</span>
                 </button>
                 <button 
                   disabled={!newPost.trim()}
                   type="button"
                   onClick={handleCreatePost}
                   className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
                 >
                   Post <Send size={16} />
                 </button>
               </div>
             </div>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-sm font-bold">
                        {post.author[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{post.author}</h4>
                        <p className="text-xs text-slate-500">{post.time}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Post options menu is coming soon.')}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                 </div>

                 <p className="text-slate-700 leading-relaxed mb-4">{post.content}</p>
                 
                 {post.image && (
                   <div className="mb-4 rounded-2xl overflow-hidden border border-slate-100">
                     <img src={post.image} alt="Post visual" className="w-full h-auto object-cover" />
                   </div>
                 )}

                 <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                    <button
                      type="button"
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 text-sm font-bold transition-colors ${post.isLiked ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
                    >
                      <ThumbsUp size={18} fill={post.isLiked ? 'currentColor' : 'none'} /> {post.likes}
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Comments UI is coming soon.')}
                      className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors"
                    >
                      <MessageSquare size={18} /> {post.comments}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleShare(post.id)}
                      className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors"
                    >
                      <Share2 size={18} /> Share
                    </button>
                    <div className="flex-grow"></div>
                    <button
                      type="button"
                      onClick={() => alert('Thanks — this post has been reported (mock).')}
                      className="text-slate-300 hover:text-red-400 transition-colors"
                      title="Report Post"
                    >
                      <Flag size={16} />
                    </button>
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </StudentLayout>
  );
};

export default CommunityFeed;
