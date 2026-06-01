import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  Heart,
  HelpCircle,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  MessageCircle,
  Plus,
  Search,
  Shield,
  SlidersHorizontal,
  Star,
  User as UserIcon,
  Users,
  Video,
  CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { apiRequest, parseApiError } from '../../lib/api';

type TabId = 'home' | 'peer' | 'community' | 'profile';
type CounselorCard = {
  /** Supabase `users.id` when row came from the API directory */
  backendUserId?: string;
  name: string;
  title: string;
  specialties: string[];
  headline: string;
  rating: number;
  studentsGuided: string;
  responseTime: string;
  languages: string[];
  about: string;
  experience: string[];
  education: string[];
  certifications: string[];
  nearestBranch: {
    name: string;
    address: string;
    distance: string;
  };
};
type PeerAmbassadorCard = {
  backendUserId?: string;
  name: string;
  title: string;
  headline: string;
  universityProgram: string;
  specialties: string[];
  rating: number;
  studentsGuided: string;
  responseTime: string;
  languages: string[];
  about: string;
  experience: string[];
  education: string[];
  certifications: string[];
};

type HomeSession = {
  meetingId?: string;
  agentId?: string;
  name: string;
  uni: string;
  time: string;
  mode: string;
};
type DirectoryUser = {
  id: string;
  displayName?: string;
  email?: string;
  profile?: {
    bio?: string;
    universityName?: string;
    country?: string;
    course?: string;
    agencyName?: string;
    countriesExpertise?: string[];
    [key: string]: unknown;
  };
};
type AmbassadorOpenSlot = {
  id: string;
  slotAt: string;
  durationMinutes?: number;
  status?: string;
};
type CommunityGroup = {
  id: string;
  name: string;
  country: string;
  category: string;
  description: string;
  members: number;
  joined: boolean;
};
type CountryGroupPost = {
  id: string;
  country: string;
  groupName: string;
  author: string;
  content: string;
  imageUrl?: string;
  imageName?: string;
  likes: number;
  date: string;
};
type CountryCommunityPost = {
  id: string;
  country: string;
  author: string;
  content: string;
  imageUrl?: string;
  imageName?: string;
  likes: number;
  date: string;
};

const NewStudentFrontend: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [search, setSearch] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [newPost, setNewPost] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [communityPosts, setCommunityPosts] = useState([
    {
      id: '1',
      author: 'Aarav Gupta',
      tag: 'Visa',
      content: 'Just received my UK student visa! Start financial documents early.',
      likes: 24,
      date: '2 hours ago',
    },
    {
      id: '2',
      author: 'Sneha Rao',
      tag: 'Housing',
      content: 'Anyone heading to University of Manchester for Fall 24? Looking for flatmates.',
      likes: 13,
      date: '5 hours ago',
    },
  ]);
  const [selectedCommunityCountry, setSelectedCommunityCountry] = useState<string | null>(null);
  const [communityTopTab, setCommunityTopTab] = useState<'all' | 'groups'>('all');
  const [selectedGroupCategory, setSelectedGroupCategory] = useState('All');
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('');
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false);
  const [selectedCommunityGroup, setSelectedCommunityGroup] = useState<string | null>(null);
  const [newPostImageUrl, setNewPostImageUrl] = useState<string | null>(null);
  const [newPostImageName, setNewPostImageName] = useState<string | null>(null);
  const [communityGroups, setCommunityGroups] = useState<CommunityGroup[]>([
    {
      id: 'g1',
      name: 'UK Visa Applicants',
      country: 'UK',
      category: 'Visa',
      description: 'Updates on CAS, VFS slots, documentation and timelines.',
      members: 1240,
      joined: false,
    },
    {
      id: 'g2',
      name: 'Canada Housing Network',
      country: 'Canada',
      category: 'Housing',
      description: 'Room sharing, rentals, and neighborhood guidance for newcomers.',
      members: 860,
      joined: true,
    },
    {
      id: 'g3',
      name: 'Australia Student Visa Support',
      country: 'Australia',
      category: 'Visa',
      description: 'Health cover, GTE, and visa interview prep support.',
      members: 990,
      joined: false,
    },
    {
      id: 'g4',
      name: 'Germany Accommodation Circle',
      country: 'Germany',
      category: 'Housing',
      description: 'Student dorm availability and city-wise rental tips.',
      members: 510,
      joined: false,
    },
    {
      id: 'g5',
      name: '2026 DeMontfort University',
      country: 'USA',
      category: 'University',
      description: 'Applicants and admits discussing DeMontfort 2026 intake.',
      members: 128,
      joined: false,
    },
  ]);
  const [countryGroupPosts, setCountryGroupPosts] = useState<CountryGroupPost[]>([
    {
      id: 'gp1',
      country: 'USA',
      groupName: '2026 DeMontfort University',
      author: 'Adoze',
      content: 'Anyone finalized accommodation near campus? Sharing my shortlist tonight.',
      likes: 8,
      date: '1 hour ago',
    },
    {
      id: 'gp2',
      country: 'USA',
      groupName: '2026 DeMontfort University',
      author: 'Muhammad Azhar',
      content: 'Visa slot updates: few openings for next week. Check regularly.',
      likes: 14,
      date: '3 hours ago',
    },
    {
      id: 'gp3',
      country: 'UK',
      groupName: 'UK Visa Applicants',
      author: 'Sneha Rao',
      content: 'Uploaded a checklist template for CAS + bank statement docs.',
      likes: 11,
      date: '5 hours ago',
    },
  ]);
  const [countryCommunityPosts, setCountryCommunityPosts] = useState<CountryCommunityPost[]>([
    {
      id: 'cp1',
      country: 'UK',
      author: 'Adoze',
      content: 'Anyone applying to UK for Jan intake? Let us connect here.',
      likes: 9,
      date: '2 hours ago',
    },
    {
      id: 'cp2',
      country: 'UK',
      author: 'Muhammad Azhar',
      content: 'Shared a quick checklist for UK visa documents in the pinned note.',
      likes: 17,
      date: '5 hours ago',
    },
    {
      id: 'cp3',
      country: 'USA',
      author: 'Sneha Rao',
      content: 'For USA Fall applicants, are you done with shortlist finalization?',
      likes: 12,
      date: '1 day ago',
    },
  ]);

  const firstName = useMemo(() => user?.name?.split(' ')[0] ?? 'Student', [user?.name]);
  const fullName = user?.name ?? 'Anonymous User';
  const email = user?.email ?? 'student@example.com';
  const profilePicture = user?.profilePicture?.trim() || null;
  const avatarLetter = (fullName?.[0] ?? 'S').toUpperCase();

  const navItems: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'home', label: 'Home', icon: GraduationCap },
    { id: 'peer', label: 'Peer Ambassadors', icon: Users },
    { id: 'community', label: 'Community', icon: MessageSquare },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];
  const [upcomingSessions, setUpcomingSessions] = useState<HomeSession[]>([]);
  const [bookingBusy, setBookingBusy] = useState<string | null>(null);
  const [ambassadorOpenSlots, setAmbassadorOpenSlots] = useState<Record<string, AmbassadorOpenSlot[]>>({});
  const [selectedAmbassadorSlotId, setSelectedAmbassadorSlotId] = useState<Record<string, string>>({});
  const [loadingAmbassadorSlotsFor, setLoadingAmbassadorSlotsFor] = useState<string | null>(null);
  const [counselorDate, setCounselorDate] = useState<string>('');
  const [counselorTime, setCounselorTime] = useState<string>('');
  const [counselorDuration, setCounselorDuration] = useState<number>(30);

  const toIsoFromLocalDateTime = (date: string, time: string) => {
    if (!date || !time) return '';
    const d = new Date(`${date}T${time}`);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString();
  };

  const formatSlotLabel = (slotAtIso: string, durationMinutes?: number) => {
    const start = new Date(slotAtIso);
    const end = new Date(start.getTime() + (durationMinutes ?? 60) * 60_000);
    return `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const loadAmbassadorSlots = async (ambassadorId: string | undefined) => {
    if (!ambassadorId) {
      alert('This peer profile is not linked to a live ambassador account yet.');
      return;
    }
    setLoadingAmbassadorSlotsFor(ambassadorId);
    try {
      const qs = new URLSearchParams({ ambassadorId }).toString();
      const slots = await apiRequest<Record<string, unknown>[]>(`/ambassador-slots/slots/open?${qs}`);
      const mapped: AmbassadorOpenSlot[] = (slots ?? []).map((slot) => ({
        id: String(slot.id ?? ''),
        slotAt: String(slot.slotAt ?? slot.slot_at ?? ''),
        durationMinutes: Number(slot.durationMinutes ?? slot.duration_minutes) || 60,
        status: String(slot.status ?? 'open'),
      }));
      setAmbassadorOpenSlots((prev) => ({ ...prev, [ambassadorId]: mapped }));
      if (mapped[0]?.id) {
        setSelectedAmbassadorSlotId((prev) => ({ ...prev, [ambassadorId]: mapped[0].id }));
      }
      if (mapped.length === 0) {
        alert('No open group sessions for this ambassador yet. Ask them to publish availability.');
      }
    } catch (e) {
      alert(parseApiError(e));
    } finally {
      setLoadingAmbassadorSlotsFor(null);
    }
  };

  const bookCounselorByAgentId = async (agentId: string | undefined, busyKey: string, slotAtIso?: string) => {
    alert('Counsellor booking is coming soon. Peer ambassador sessions are live now.');
    return;
    if (!agentId) {
      alert('This profile is not linked to a live counselor account yet. Open Counselors after data loads.');
      return;
    }
    const chosenSlotAt = slotAtIso || toIsoFromLocalDateTime(counselorDate, counselorTime);
    if (!chosenSlotAt) {
      alert('Select a preferred date and time before booking.');
      return;
    }
    setBookingBusy(busyKey);
    try {
      await apiRequest('/counselor-meetings/book', {
        method: 'POST',
        body: {
          agentId,
          slotAt: chosenSlotAt,
          durationMinutes: counselorDuration,
          callType: 'video',
        },
      });
      alert('Session booked. Open My Schedule to join your Meet link.');
    } catch (e) {
      alert(parseApiError(e));
    } finally {
      setBookingBusy(null);
    }
  };

  const bookAmbassadorFirstSlot = async (ambassadorId: string | undefined, busyKey: string, slotId?: string) => {
    if (!ambassadorId) {
      alert('This peer profile is not linked to a live ambassador account yet.');
      return;
    }
    const chosenSlotId = slotId || selectedAmbassadorSlotId[ambassadorId];
    if (!chosenSlotId) {
      alert('Load and select a slot first.');
      return;
    }
    setBookingBusy(busyKey);
    try {
      await apiRequest('/ambassador-slots/book', {
        method: 'POST',
        body: { slotId: chosenSlotId, paymentId: 'local-dev', amountPaid: 0 },
      });
      alert('You are booked. Open My Schedule for the Meet link.');
    } catch (e) {
      alert(parseApiError(e));
    } finally {
      setBookingBusy(null);
    }
  };

  const registerForEvent = async (eventId: string | undefined) => {
    if (!eventId) {
      alert('Save events from the server: open Home so upcoming fairs load, then tap Register.');
      return;
    }
    setBookingBusy(`event-${eventId}`);
    try {
      await apiRequest(`/events/${eventId}/rsvp`, { method: 'POST' });
      alert('You are registered for this event.');
    } catch (e) {
      alert(parseApiError(e));
    } finally {
      setBookingBusy(null);
    }
  };

  const [selectedPeerAmbassador, setSelectedPeerAmbassador] = useState<PeerAmbassadorCard | null>(null);
  const [peerCards, setPeerCards] = useState<PeerAmbassadorCard[]>([]);
  const peerAmbassadors: PeerAmbassadorCard[] = [
    {
      name: 'Rahul Khanna',
      title: 'Senior Student Ambassador',
      headline: 'Visa, housing, and first-semester transition mentor',
      universityProgram: "University of Melbourne â€¢ Master's in Data Science",
      specialties: ['Visa', 'Housing', 'Part-time Jobs', 'SOP Review'],
      rating: 4.9,
      studentsGuided: '300+',
      responseTime: '< 2 hours',
      languages: ['English', 'Hindi'],
      about:
        'Helps students with practical transition support: visa checklists, accommodation shortlisting, and settling into campus life in Australia.',
      experience: [
        'Peer Ambassador, PeerNXT (2024 - Present)',
        'International Student Buddy, University of Melbourne (2023 - Present)',
      ],
      education: ["Master's in Data Science, University of Melbourne"],
      certifications: ['Peer Mentoring Excellence Badge', 'Student Community Leadership Certificate'],
    },
    {
      name: 'Aisha Thomas',
      title: 'Peer Ambassador',
      headline: 'Application shortlisting and scholarship strategy guide',
      universityProgram: "University of Toronto â€¢ Master's in Computer Science",
      specialties: ['University Shortlisting', 'Scholarships', 'Student Life', 'Networking'],
      rating: 4.8,
      studentsGuided: '220+',
      responseTime: '< 3 hours',
      languages: ['English', 'Malayalam', 'Hindi'],
      about:
        'Supports incoming students with profile positioning, scholarship applications, and networking in their first year abroad.',
      experience: [
        'Peer Ambassador, PeerNXT (2024 - Present)',
        'Scholarship Mentor, GradConnect Canada (2022 - 2024)',
      ],
      education: ["Master's in Computer Science, University of Toronto"],
      certifications: ['International Student Mentor Certificate', 'Campus Leadership Fellowship'],
    },
    {
      name: 'Nikhil Rao',
      title: 'Peer Ambassador',
      headline: 'Career-focused advisor for UK admissions and internships',
      universityProgram: "University of Manchester â€¢ MBA",
      specialties: ['UK Admissions', 'Internships', 'CV Review', 'Career Planning'],
      rating: 4.8,
      studentsGuided: '260+',
      responseTime: '< 2 hours',
      languages: ['English', 'Hindi', 'Kannada'],
      about:
        'Guides students through UK admissions while aligning course choices with career outcomes and internship opportunities.',
      experience: [
        'Peer Ambassador, PeerNXT (2023 - Present)',
        'Career Mentor, UK Student Guild (2022 - Present)',
      ],
      education: ['MBA, University of Manchester'],
      certifications: ['Certified Student Career Coach', 'Global Mentorship Program Credential'],
    },
  ];
  const [events, setEvents] = useState<
    { eventId?: string; date: string; month: string; title: string; time: string; location: string; color: string }[]
  >([
    { eventId: '', date: '24', month: 'JAN', title: 'UK University Fair 2025', time: '10:00 AM - 5:00 PM', location: 'Online', color: 'bg-orange-500' },
    { eventId: '', date: '28', month: 'JAN', title: 'Scholarship Webinar', time: '6:00 PM - 8:00 PM', location: 'Zoom Meeting', color: 'bg-blue-500' },
  ]);
  const [selectedCounselor, setSelectedCounselor] = useState<CounselorCard | null>(null);
  const [counselorCards, setCounselorCards] = useState<CounselorCard[]>([]);
  const counselors: CounselorCard[] = [
    {
      name: 'Dr. Sarah Wilson',
      title: 'Senior Counsellor â€¢ AECC Bangalore',
      specialties: ['USA', 'UK', 'Canada', 'Australia'],
      headline: 'Senior Admission & Visa Consultant',
      rating: 4.9,
      studentsGuided: '1,200+',
      responseTime: '< 2 hours',
      languages: ['English', 'Hindi', 'Kannada'],
      about:
        '12+ years helping students secure admits, scholarships, and visa approvals across top global universities.',
      experience: [
        'Lead Counsellor, AECC Bangalore (2019 - Present)',
        'International Admissions Advisor, UniBridge (2014 - 2019)',
      ],
      education: ['M.Ed. in International Education, University of Leeds'],
      certifications: ['ICEF Trained Agent Counselor', 'British Council Certified Counsellor'],
      nearestBranch: {
        name: 'AECC Bangalore - Koramangala',
        address: '80 Feet Road, Koramangala 4th Block, Bangalore',
        distance: '2.3 km from student location',
      },
    },
    {
      name: 'James Peterson',
      title: 'Senior Counsellor â€¢ AECC Bangalore',
      specialties: ['USA', 'UK', 'Canada', 'Australia'],
      headline: 'Overseas Education & Profile Strategy Expert',
      rating: 4.8,
      studentsGuided: '950+',
      responseTime: '< 3 hours',
      languages: ['English', 'Hindi'],
      about:
        'Specializes in profile building, statement of purpose reviews, and shortlist strategy for STEM and business programs.',
      experience: [
        'Senior Study Abroad Advisor, AECC Bangalore (2020 - Present)',
        'Admissions Mentor, Global Pathways (2015 - 2020)',
      ],
      education: ['MBA, University of Manchester'],
      certifications: ['QEAC Certified Counsellor', 'US Admissions Training - NACAC Partner Program'],
      nearestBranch: {
        name: 'AECC Bangalore - Whitefield',
        address: 'ITPL Main Road, Whitefield, Bangalore',
        distance: '5.1 km from student location',
      },
    },
  ];

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoadingData(true);
      setDataError(null);
      try {
        const [eventList, ambassadorsDirectory] = await Promise.all([
          apiRequest<any[]>('/events?limit=6'),
          apiRequest<DirectoryUser[]>('/users?role=ambassador'),
        ]);
        if (!isMounted) return;

        const colorPool = ['bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-emerald-500'];
        const mappedEvents = (eventList ?? []).slice(0, 4).map((event, idx) => {
          const start = new Date(String(event.startAt));
          const end = new Date(String(event.endAt));
          return {
            eventId: String(event.id ?? ''),
            date: String(start.getDate()).padStart(2, '0'),
            month: start.toLocaleString(undefined, { month: 'short' }).toUpperCase(),
            title: String(event.title ?? 'Event'),
            time: `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            location: String(event.locationDetails ?? event.locationType ?? 'Online'),
            color: colorPool[idx % colorPool.length],
          };
        });
        if (mappedEvents.length > 0) setEvents(mappedEvents);


        const mappedAmbassadors = (ambassadorsDirectory ?? []).slice(0, 8).map((user, idx) => {
          const name = String(user.displayName ?? user.email ?? `Ambassador ${idx + 1}`);
          const profile = (user.profile ?? {}) as DirectoryUser['profile'];
          const university = String(profile.universityName ?? 'University');
          const country = String(profile.country ?? 'Global');
          const course = String(profile.course ?? 'Program');
          return {
            backendUserId: String(user.id),
            name,
            title: 'Peer Ambassador',
            headline: 'Student mentor for admissions and campus transition',
            universityProgram: `${university} â€¢ ${course}`,
            specialties: ['Visa', 'Housing', 'Student Life', country],
            rating: 4.8,
            studentsGuided: `${180 + idx * 25}+`,
            responseTime: '< 3 hours',
            languages: ['English'],
            about: String(profile.bio ?? 'Peer mentor helping new students with practical guidance and transition support.'),
            experience: ['Peer Ambassador at PeerNXT'],
            education: [`${course}, ${university}`],
            certifications: ['PeerNXT Verified Ambassador'],
          } as PeerAmbassadorCard;
        });
        if (mappedAmbassadors.length > 0) setPeerCards(mappedAmbassadors);
      } catch (error) {
        if (!isMounted) return;
        setDataError(parseApiError(error));
      } finally {
        if (isMounted) setIsLoadingData(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const createPost = () => {
    const trimmed = newPost.trim();
    if (!trimmed) return;
    setCommunityPosts((prev) => [
      { id: Date.now().toString(), author: fullName, tag: selectedTag === 'All' ? 'General' : selectedTag, content: trimmed, likes: 0, date: 'Just now' },
      ...prev,
    ]);
    setNewPost('');
  };

  const toggleJoinGroup = (groupId: string) => {
    setCommunityGroups((prev) =>
      prev.map((group) => {
        if (group.id !== groupId) return group;
        const joined = !group.joined;
        return {
          ...group,
          joined,
          members: joined ? group.members + 1 : Math.max(group.members - 1, 0),
        };
      }),
    );
  };

  const createCommunityGroup = () => {
    if (!selectedCommunityCountry) return;
    const name = newGroupName.trim();
    const category = newGroupCategory.trim();
    if (!name || !category) return;
    setCommunityGroups((prev) => [
      {
        id: Date.now().toString(),
        name,
        country: selectedCommunityCountry,
        category,
        description: 'Student-created group for focused discussions.',
        members: 1,
        joined: true,
      },
      ...prev,
    ]);
    setSelectedCommunityGroup(name);
    setNewGroupName('');
    setNewGroupCategory('');
    setShowCreateGroupForm(false);
  };

  const createCountryGroupPost = () => {
    const content = newPost.trim();
    if ((!content && !newPostImageUrl) || !selectedCommunityCountry || !selectedCommunityGroup) return;
    setCountryGroupPosts((prev) => [
      {
        id: Date.now().toString(),
        country: selectedCommunityCountry,
        groupName: selectedCommunityGroup,
        author: fullName,
        content,
        imageUrl: newPostImageUrl ?? undefined,
        imageName: newPostImageName ?? undefined,
        likes: 0,
        date: 'Just now',
      },
      ...prev,
    ]);
    setNewPost('');
    setNewPostImageUrl(null);
    setNewPostImageName(null);
  };

  const createCountryCommunityPost = () => {
    const content = newPost.trim();
    if ((!content && !newPostImageUrl) || !selectedCommunityCountry) return;
    setCountryCommunityPosts((prev) => [
      {
        id: Date.now().toString(),
        country: selectedCommunityCountry,
        author: fullName,
        content,
        imageUrl: newPostImageUrl ?? undefined,
        imageName: newPostImageName ?? undefined,
        likes: 0,
        date: 'Just now',
      },
      ...prev,
    ]);
    setNewPost('');
    setNewPostImageUrl(null);
    setNewPostImageName(null);
  };

  const handlePostImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setNewPostImageUrl(imageUrl);
    setNewPostImageName(file.name);
  };

  const renderHome = () => (
    <div className="space-y-8">
      <header className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-bold overflow-hidden">
          {profilePicture ? (
            <img src={profilePicture} alt={fullName} className="h-full w-full object-cover" />
          ) : (
            avatarLetter
          )}
        </div>
        <div>
          <p className="text-sm text-gray-500">Hi, Good Morning</p>
          <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
        </div>
      </header>

      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search universities, counsellors, or questions"
            className="h-14 w-full rounded-2xl border border-gray-100 bg-white pl-12 pr-4 shadow-sm outline-none focus:border-[#7c4dff]"
          />
        </div>
        <button className="h-14 w-14 rounded-2xl border border-gray-100 bg-white shadow-sm text-gray-500 grid place-items-center">
          <SlidersHorizontal size={20} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { id: 'peer' as TabId, label: 'Talk to Senior', icon: GraduationCap, color: 'bg-[#7c4dff]' },
          { id: 'community' as TabId, label: 'Ask Community', icon: MessageSquare, color: 'bg-[#e91e63]' },
          { id: 'home' as TabId, label: 'Find Events', icon: Calendar, color: 'bg-[#ff9800]' },
        ].map((item) => (
          <button key={item.label} onClick={() => setActiveTab(item.id)} className="flex flex-col items-center gap-3 transition-transform hover:-translate-y-0.5">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg ${item.color}`}>
              <item.icon size={20} />
            </div>
            <span className="text-center text-[10px] font-bold leading-tight text-gray-600">{item.label}</span>
          </button>
        ))}
      </div>


      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Trending Community Posts</h3>
          <button onClick={() => setActiveTab('community')} className="text-sm font-bold text-[#7c4dff]">View all</button>
        </div>
        <div className="space-y-4 xl:grid xl:grid-cols-2 xl:gap-4 xl:space-y-0">
          {communityPosts.map((post) => (
            <div key={post.id} className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm space-y-3 transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-900">{post.author}</p>
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-600">{post.tag}</span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-4 text-gray-400">
                <span className="flex items-center gap-1 text-xs font-bold"><Heart size={14} /> {post.likes}</span>
                <span className="flex items-center gap-1 text-xs font-bold"><MessageCircle size={14} /> 0</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 lg:hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Events & fairs</h3>
          <button className="text-sm font-bold text-[#7c4dff]">View all</button>
        </div>
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.title} className="rounded-3xl bg-white shadow-sm overflow-hidden flex items-stretch">
              <div className={`flex w-20 flex-col items-center justify-center text-white ${event.color}`}>
                <span className="text-2xl font-bold">{event.date}</span>
                <span className="text-xs font-bold">{event.month}</span>
              </div>
              <div className="flex-1 p-4">
                <h4 className="font-bold text-gray-900">{event.title}</h4>
                <div className="mt-1 flex items-center gap-4 text-[10px] text-gray-500">
                  <span className="flex items-center gap-1"><Clock size={12} /> {event.time}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {event.location}</span>
                </div>
                <button
                  type="button"
                  disabled={!!bookingBusy}
                  onClick={() => void registerForEvent(event.eventId)}
                  className={`mt-3 rounded-xl h-8 px-4 text-[10px] font-bold text-white disabled:opacity-50 ${event.color}`}
                >
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderHomeDesktopRail = () => (
    <aside className="hidden lg:block space-y-5">
      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Events & fairs</h3>
          <button className="text-xs font-bold text-[#7c4dff]">View all</button>
        </div>
        <div className="mt-4 space-y-3">
          {events.map((event) => (
            <div key={event.title} className="rounded-2xl bg-slate-50 p-3 border border-slate-100">
              <p className="text-xs font-bold text-slate-900">{event.title}</p>
              <p className="text-[11px] text-slate-500 mt-1">{event.time}</p>
              <p className="text-[11px] text-slate-500">{event.location}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 className="font-bold text-gray-900">Today&apos;s Focus</h3>
        <div className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Upcoming sessions</span>
            <span className="font-bold text-[#7c4dff]">{upcomingSessions.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Unread notifications</span>
            <span className="font-bold text-[#7c4dff]">4</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">New community replies</span>
            <span className="font-bold text-[#7c4dff]">7</span>
          </div>
        </div>
      </div>
    </aside>
  );

  const renderPeer = () => (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <button className="rounded-full p-2 hover:bg-gray-100"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-bold text-gray-900">Peer Ambassadors</h2>
      </header>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            placeholder="Find a senior or university"
            className="h-12 w-full rounded-2xl border border-gray-100 bg-white pl-12 pr-4 shadow-sm outline-none focus:border-[#7c4dff]"
          />
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {['Country', 'University', 'Course'].map((f) => (
            <button key={f} className="rounded-xl border border-gray-100 bg-white text-xs font-bold px-3 py-2 shadow-sm text-gray-700">{f}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {(peerCards.length > 0 ? peerCards : peerAmbassadors).map((peer) => (
        <div key={peer.name} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-gray-900">{peer.name}</h3>
              <p className="text-sm text-gray-500">{peer.title}</p>
              <p className="text-xs text-gray-400 mt-1">{peer.universityProgram}</p>
            </div>
            <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
              <Star size={14} fill="currentColor" /> {peer.rating}
            </div>
          </div>
          <button
            onClick={() => setSelectedPeerAmbassador(peer)}
            className="mt-4 w-full rounded-2xl bg-[#7c4dff] text-white py-2.5 text-sm font-bold hover:bg-[#651fff]"
          >
            View Profile
          </button>
        </div>
      ))}
      </div>
    </div>
  );

  const renderPeerAmbassadorProfilePage = () => {
    if (!selectedPeerAmbassador) return null;
    return (
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          <button
            onClick={() => setSelectedPeerAmbassador(null)}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Back to peer ambassadors"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Peer Ambassador Profile</h2>
        </header>

        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-[#7c4dff] via-[#6a5acd] to-[#3f51b5]" />
          <div className="relative px-6 pb-6">
            <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-white text-2xl font-bold text-[#7c4dff] shadow-md">
              {selectedPeerAmbassador.name.charAt(0)}
            </div>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">{selectedPeerAmbassador.name}</h3>
                <p className="text-sm font-semibold text-[#7c4dff]">{selectedPeerAmbassador.headline}</p>
                <p className="text-sm text-gray-600">{selectedPeerAmbassador.title}</p>
                <p className="text-xs text-gray-500">{selectedPeerAmbassador.universityProgram}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={!!bookingBusy}
                  onClick={() => void loadAmbassadorSlots(selectedPeerAmbassador.backendUserId)}
                  className="rounded-xl bg-[#7c4dff] px-4 py-2 text-xs font-bold text-white hover:bg-[#651fff] disabled:opacity-50"
                >
                  {loadingAmbassadorSlotsFor === selectedPeerAmbassador.backendUserId ? 'Loading slots...' : 'Load slots'}
                </button>
                <button className="rounded-xl border border-[#7c4dff]/30 bg-white px-4 py-2 text-xs font-bold text-[#7c4dff] hover:bg-purple-50">
                  Save Profile
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-600">
                <Star size={12} fill="currentColor" /> {selectedPeerAmbassador.rating} rating
              </span>
              <span className="rounded-full bg-purple-50 px-3 py-1 font-bold text-purple-600">
                {selectedPeerAmbassador.studentsGuided} students guided
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-600">
                Responds in {selectedPeerAmbassador.responseTime}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedPeerAmbassador.specialties.map((item) => (
                <span key={item} className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] font-bold text-[#7c4dff]">
                  {item}
                </span>
              ))}
            </div>
            {selectedPeerAmbassador.backendUserId && ambassadorOpenSlots[selectedPeerAmbassador.backendUserId]?.length ? (
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                <p className="text-xs font-bold text-indigo-700 mb-2">Available group slots</p>
                <select
                  value={selectedAmbassadorSlotId[selectedPeerAmbassador.backendUserId] ?? ''}
                  onChange={(e) =>
                    setSelectedAmbassadorSlotId((prev) => ({
                      ...prev,
                      [selectedPeerAmbassador.backendUserId as string]: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm"
                >
                  {ambassadorOpenSlots[selectedPeerAmbassador.backendUserId].map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {formatSlotLabel(slot.slotAt, slot.durationMinutes)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={!!bookingBusy}
                  onClick={() =>
                    void bookAmbassadorFirstSlot(
                      selectedPeerAmbassador.backendUserId,
                      'peer-request',
                      selectedAmbassadorSlotId[selectedPeerAmbassador.backendUserId]
                    )
                  }
                  className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Book selected slot
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">About</h4>
          <p className="text-sm text-gray-700 leading-6">{selectedPeerAmbassador.about}</p>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Experience</h4>
          {selectedPeerAmbassador.experience.map((item) => (
            <div key={item} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-gray-700">
              {item}
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Education</h4>
            {selectedPeerAmbassador.education.map((item) => (
              <p key={item} className="text-sm text-gray-700">â€¢ {item}</p>
            ))}
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Certifications</h4>
            {selectedPeerAmbassador.certifications.map((item) => (
              <p key={item} className="text-sm text-gray-700">â€¢ {item}</p>
            ))}
          </section>
        </div>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Languages</h4>
          <div className="flex flex-wrap gap-2">
            {selectedPeerAmbassador.languages.map((language) => (
              <span key={language} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                {language}
              </span>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderCounselors = () => (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <button className="rounded-full p-2 hover:bg-gray-100"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-bold text-gray-900">Verified Counsellors</h2>
      </header>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {(counselorCards.length > 0 ? counselorCards : counselors).map((counselor) => (
        <div key={counselor.name} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900">{counselor.name}</h3>
          <p className="text-sm text-gray-500">{counselor.title}</p>
          <div className="mt-3 flex gap-2">
            {counselor.specialties.map((t) => (
              <span key={t} className="px-2 py-1 rounded-lg bg-gray-50 text-[10px] font-bold text-[#7c4dff] border border-gray-100">
                {t}
              </span>
            ))}
          </div>
          <button
            onClick={() => setSelectedCounselor(counselor)}
            className="mt-4 w-full rounded-2xl bg-[#7c4dff] text-white py-2.5 text-sm font-bold hover:bg-[#651fff]"
          >
            View Profile
          </button>
        </div>
      ))}
      </div>
    </div>
  );

  const renderCounselorProfilePage = () => {
    if (!selectedCounselor) return null;
    return (
      <div className="space-y-6">
        <header className="flex items-center gap-4">
          <button
            onClick={() => setSelectedCounselor(null)}
            className="rounded-full p-2 hover:bg-gray-100"
            aria-label="Back to counselors"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Counselor Profile</h2>
        </header>

        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-[#7c4dff] via-[#9c27b0] to-[#e91e63]" />
          <div className="relative px-6 pb-6">
            <div className="-mt-10 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-white text-2xl font-bold text-[#7c4dff] shadow-md">
              {selectedCounselor.name.charAt(0)}
            </div>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">{selectedCounselor.name}</h3>
                <p className="text-sm font-semibold text-[#7c4dff]">{selectedCounselor.headline}</p>
                <p className="text-sm text-gray-600">{selectedCounselor.title}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={!!bookingBusy}
                  onClick={() =>
                    void bookCounselorByAgentId(
                      selectedCounselor.backendUserId,
                      'counselor-request',
                      toIsoFromLocalDateTime(counselorDate, counselorTime)
                    )
                  }
                  className="rounded-xl bg-[#7c4dff] px-4 py-2 text-xs font-bold text-white hover:bg-[#651fff] disabled:opacity-50"
                >
                  Book selected time
                </button>
                <button className="rounded-xl border border-[#7c4dff]/30 bg-white px-4 py-2 text-xs font-bold text-[#7c4dff] hover:bg-purple-50">
                  Save Profile
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-600">
                <Star size={12} fill="currentColor" /> {selectedCounselor.rating} rating
              </span>
              <span className="rounded-full bg-purple-50 px-3 py-1 font-bold text-purple-600">
                {selectedCounselor.studentsGuided} students guided
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-600">
                Responds in {selectedCounselor.responseTime}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedCounselor.specialties.map((item) => (
                <span key={item} className="rounded-lg border border-gray-100 bg-gray-50 px-2 py-1 text-[10px] font-bold text-[#7c4dff]">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 p-3">
              <p className="text-xs font-bold text-purple-700 mb-2">Choose your preferred slot</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="date"
                  value={counselorDate}
                  onChange={(e) => setCounselorDate(e.target.value)}
                  className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm"
                />
                <input
                  type="time"
                  value={counselorTime}
                  onChange={(e) => setCounselorTime(e.target.value)}
                  className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm"
                />
                <select
                  value={counselorDuration}
                  onChange={(e) => setCounselorDuration(Number(e.target.value) || 30)}
                  className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm"
                >
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">About</h4>
          <p className="text-sm text-gray-700 leading-6">{selectedCounselor.about}</p>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Experience</h4>
          {selectedCounselor.experience.map((item) => (
            <div key={item} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-gray-700">
              {item}
            </div>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Education</h4>
            {selectedCounselor.education.map((item) => (
              <p key={item} className="text-sm text-gray-700">â€¢ {item}</p>
            ))}
          </section>

          <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Certifications</h4>
            {selectedCounselor.certifications.map((item) => (
              <p key={item} className="text-sm text-gray-700">â€¢ {item}</p>
            ))}
          </section>
        </div>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm space-y-2">
          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500">Languages</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCounselor.languages.map((language) => (
              <span key={language} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                {language}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-purple-100 bg-purple-50 p-6 shadow-sm space-y-1">
          <h4 className="text-xs font-bold uppercase tracking-wide text-purple-600">Nearest branch</h4>
          <p className="text-sm font-semibold text-gray-900">{selectedCounselor.nearestBranch.name}</p>
          <p className="text-sm text-gray-700">{selectedCounselor.nearestBranch.address}</p>
          <p className="text-xs font-semibold text-purple-600">{selectedCounselor.nearestBranch.distance}</p>
        </section>
      </div>
    );
  };

  const renderCommunity = () => (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {selectedCommunityCountry ? (
            <button
              onClick={() => {
                setSelectedCommunityCountry(null);
                setSelectedCommunityGroup(null);
                setShowCreateGroupForm(false);
              }}
              className="rounded-full p-2 hover:bg-gray-100"
              aria-label="Back to countries"
            >
              <ChevronLeft size={24} />
            </button>
          ) : (
            <button className="rounded-full p-2 hover:bg-gray-100"><ChevronLeft size={24} /></button>
          )}
          <h2 className="text-xl font-bold text-gray-900">
            {selectedCommunityGroup
              ? selectedCommunityGroup
              : selectedCommunityCountry
              ? `${selectedCommunityCountry} Community`
              : 'Community Countries'}
          </h2>
        </div>
        <button className="rounded-full p-2 border border-gray-100 hover:bg-gray-100"><Search size={20} /></button>
      </header>

      {!selectedCommunityCountry ? (
        <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Countries</h3>
            <span className="text-xs text-gray-500">Countries are admin-managed</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['UK', 'USA', 'Canada', 'Australia', 'Germany'].map((country) => {
              const groupsCount = communityGroups.filter((group) => group.country === country).length;
              const membersCount = communityGroups
                .filter((group) => group.country === country)
                .reduce((total, group) => total + group.members, 0);
              return (
                <button
                  key={country}
                  onClick={() => {
                    setSelectedCommunityCountry(country);
                    setCommunityTopTab('all');
                    setSelectedGroupCategory('All');
                    setSelectedCommunityGroup(null);
                    setShowCreateGroupForm(false);
                  }}
                  className="rounded-2xl border border-gray-100 bg-slate-50 p-4 text-left hover:border-[#7c4dff]/40 hover:bg-purple-50 transition-colors"
                >
                  <p className="text-base font-bold text-gray-900">{country}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {groupsCount} groups â€¢ {membersCount.toLocaleString()} members
                  </p>
                  <p className="mt-3 text-xs font-semibold text-[#7c4dff]">Open Country Network</p>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      {selectedCommunityCountry && (
        <>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 'all' as const, label: 'All' },
              { id: 'groups' as const, label: 'Groups' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCommunityTopTab(tab.id)}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold ${
                  communityTopTab === tab.id ? 'bg-[#7c4dff] text-white' : 'bg-white text-gray-500 border border-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {communityTopTab === 'groups' && (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {['All', 'Visa', 'University', 'Housing', 'Scholarship', 'Jobs', 'Other'].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedGroupCategory(category)}
                      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold ${
                        selectedGroupCategory === category ? 'bg-[#7c4dff] text-white' : 'bg-white text-gray-500 border border-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowCreateGroupForm((prev) => !prev)}
                  className="whitespace-nowrap rounded-xl bg-[#7c4dff] px-4 py-2 text-xs font-bold text-white hover:bg-[#651fff]"
                >
                  {showCreateGroupForm ? 'Close' : 'Create Group'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {communityGroups
                  .filter((group) => group.country === selectedCommunityCountry)
                  .filter((group) => selectedGroupCategory === 'All' || group.category === selectedGroupCategory)
                  .map((group) => (
                    <button
                      key={group.id}
                      onClick={() => {
                        setSelectedCommunityGroup(group.name);
                        if (!group.joined) toggleJoinGroup(group.id);
                      }}
                      className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition-colors ${
                        selectedCommunityGroup === group.name
                          ? 'border-[#7c4dff] bg-purple-50 text-[#7c4dff]'
                          : 'border-gray-100 bg-slate-50 text-gray-800 hover:border-[#7c4dff]/40'
                      }`}
                    >
                      {group.name}
                    </button>
                  ))}
              </div>

              {showCreateGroupForm && (
                <div className="rounded-2xl border border-dashed border-[#7c4dff]/40 bg-purple-50 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Group name (e.g., 2027 Jan Intake Cornell)"
                      className="h-10 rounded-xl border border-purple-100 bg-white px-3 text-sm outline-none focus:border-[#7c4dff]"
                    />
                    <input
                      value={newGroupCategory}
                      onChange={(e) => setNewGroupCategory(e.target.value)}
                      placeholder="Category (e.g., University, Jobs, Housing)"
                      className="h-10 rounded-xl border border-purple-100 bg-white px-3 text-sm outline-none focus:border-[#7c4dff]"
                    />
                  </div>
                  <button
                    onClick={createCommunityGroup}
                    className="rounded-xl bg-[#7c4dff] px-4 py-2 text-xs font-bold text-white hover:bg-[#651fff]"
                  >
                    Create Group
                  </button>
                </div>
              )}
            </>
          )}

          {communityTopTab === 'all' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-28">
              {countryCommunityPosts
                .filter((post) => post.country === selectedCommunityCountry)
                .map((post) => (
                  <div key={post.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-3 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">{post.author}</p>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-purple-50 text-purple-600 font-bold">
                        {selectedCommunityCountry} Community
                      </span>
                    </div>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.imageName ?? 'Post attachment'}
                      className="w-full max-h-64 object-cover rounded-2xl border border-gray-100"
                    />
                  )}
                    <p className="text-sm text-gray-700">{post.content}</p>
                    <div className="flex items-center gap-4 text-gray-400">
                      <span className="flex items-center gap-1 text-xs font-bold">
                        <Heart size={14} /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold">
                        <MessageCircle size={14} /> 0
                      </span>
                      <span className="ml-auto text-xs">{post.date}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {communityTopTab === 'groups' && selectedCommunityGroup && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-28">
              {countryGroupPosts
                .filter((post) => post.country === selectedCommunityCountry && post.groupName === selectedCommunityGroup)
                .map((post) => (
                  <div key={post.id} className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm space-y-3 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold">{post.author}</p>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-purple-50 text-purple-600 font-bold">{post.groupName}</span>
                    </div>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt={post.imageName ?? 'Post attachment'}
                      className="w-full max-h-64 object-cover rounded-2xl border border-gray-100"
                    />
                  )}
                    <p className="text-sm text-gray-700">{post.content}</p>
                    <div className="flex items-center gap-4 text-gray-400">
                      <span className="flex items-center gap-1 text-xs font-bold">
                        <Heart size={14} /> {post.likes}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold">
                        <MessageCircle size={14} /> 0
                      </span>
                      <span className="ml-auto text-xs">{post.date}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <div className="fixed bottom-16 md:bottom-4 left-4 right-4 lg:left-[300px] lg:right-8 z-40 bg-white rounded-3xl border border-gray-100 p-4 shadow-sm">
            <input
              id="community-post-image-input"
              type="file"
              accept="image/*"
              onChange={handlePostImageSelect}
              className="hidden"
            />
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={2}
              placeholder={
                communityTopTab === 'all'
                  ? `Share with everyone in ${selectedCommunityCountry} community...`
                  : selectedCommunityGroup
                  ? `Share an update in ${selectedCommunityGroup}...`
                  : 'Select a group first, then write your post...'
              }
              disabled={communityTopTab === 'groups' && !selectedCommunityGroup}
              className="w-full resize-none bg-transparent outline-none text-sm disabled:text-gray-400"
            />
            {newPostImageName && (
              <p className="mt-2 text-xs font-semibold text-[#7c4dff]">{newPostImageName}</p>
            )}
            <div className="flex items-center justify-between mt-2 border-t border-gray-50 pt-2">
              <label
                htmlFor="community-post-image-input"
                className={`mr-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#7c4dff]/30 text-[#7c4dff] ${
                  communityTopTab === 'groups' && !selectedCommunityGroup ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-purple-50'
                }`}
              >
                <Plus size={16} />
              </label>
              <button
                onClick={communityTopTab === 'all' ? createCountryCommunityPost : createCountryGroupPost}
                disabled={communityTopTab === 'groups' && !selectedCommunityGroup}
                className="rounded-xl bg-[#7c4dff] text-white text-xs font-bold px-5 py-2 hover:bg-[#651fff] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="-m-4 md:-m-8">
      <div className="relative h-48 bg-brand-gradient md:h-64">
        <button className="absolute left-6 top-6 rounded-full bg-white/20 p-2 text-white backdrop-blur-md">
          <ChevronLeft size={24} />
        </button>
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white shadow-xl bg-white flex items-center justify-center text-3xl font-bold text-[#7c4dff]">
              {profilePicture ? (
                <img src={profilePicture} alt={fullName} className="h-full w-full object-cover" />
              ) : (
                avatarLetter
              )}
            </div>
            <button className="absolute bottom-0 right-0 rounded-full bg-[#7c4dff] p-2 text-white shadow-lg">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="mt-16 px-4 pb-20 md:px-8">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">{fullName}</h2>
          <p className="text-sm text-gray-500">{email}</p>
          <div className="mt-2 inline-flex rounded-full bg-purple-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-600">
            Student
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 px-2">Account Settings</h3>
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {[
              { label: 'Personal Information', icon: UserIcon, color: 'text-blue-500' },
              { label: 'Payments and Payouts', icon: CreditCard, color: 'text-orange-500' },
              { label: 'Notifications', icon: Bell, color: 'text-purple-500' },
              { label: 'Privacy and Sharing', icon: Shield, color: 'text-green-500' },
              { label: 'Login & Security', icon: Lock, color: 'text-red-500' },
              { label: 'Help Center', icon: HelpCircle, color: 'text-gray-500' },
            ].map((item, idx, arr) => (
              <button
                key={item.label}
                className={`flex w-full items-center justify-between p-5 transition-colors hover:bg-gray-50 ${
                  idx !== arr.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <span className="flex items-center gap-4 text-sm font-bold text-gray-700">
                  <span className={`rounded-xl bg-gray-50 p-2.5 ${item.color}`}>
                    <item.icon size={20} />
                  </span>
                  {item.label}
                </span>
                <ChevronRight size={18} className="text-gray-300" />
              </button>
            ))}
          </div>
          <button
            onClick={logout}
            className="w-full rounded-2xl border border-red-100 py-4 text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <span className="inline-flex items-center gap-2">
              <LogOut size={18} />
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderActiveView = () => {
    if (activeTab === 'peer') return selectedPeerAmbassador ? renderPeerAmbassadorProfilePage() : renderPeer();
    if (activeTab === 'community') return renderCommunity();
    if (activeTab === 'profile') return renderProfile();
    return renderHome();
  };

  const desktopNav = (
    <aside className="hidden lg:block">
      <div className="sticky top-24 rounded-3xl border border-gray-100 bg-white p-3 shadow-sm">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full rounded-2xl px-4 py-3 mb-1 flex items-center gap-3 text-sm font-semibold transition-colors ${
              activeTab === item.id
                ? 'bg-[#7c4dff] text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </button>
        ))}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#1a1a1a] pb-20 md:pb-0">
      <header className="sticky top-0 z-50 h-16 border-b border-gray-100 bg-white px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient text-white flex items-center justify-center">
            <GraduationCap size={18} />
          </div>
          <h1 className="font-bold text-[#7c4dff]">PeerNXT</h1>
        </div>
        <div className="hidden md:flex lg:hidden items-center gap-6">
          {navItems.filter((item) => item.id !== 'profile').map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`text-sm font-semibold ${activeTab === item.id ? 'text-[#7c4dff]' : 'text-gray-500 hover:text-[#7c4dff]'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="hidden lg:flex flex-1 max-w-xl mx-8 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search peers, counsellors, events..."
            className="w-full h-11 rounded-2xl border border-gray-100 bg-slate-50 pl-11 pr-4 outline-none focus:border-[#7c4dff]"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="text-gray-500 hover:text-[#7c4dff]"><Search size={20} /></button>
          <button className="text-gray-500 hover:text-[#7c4dff]"><Bell size={20} /></button>
          <button onClick={() => setActiveTab('profile')} className="h-8 w-8 rounded-full bg-brand-gradient text-white grid place-items-center text-xs font-bold overflow-hidden">
            {profilePicture ? (
              <img src={profilePicture} alt={fullName} className="h-full w-full object-cover" />
            ) : (
              avatarLetter
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] p-4 md:p-8">
        {dataError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{dataError}</div>
        )}
        {isLoadingData && (
          <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">Loading latest data...</div>
        )}
        <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-8">
          {desktopNav}
          {activeTab === 'home' ? (
            <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-6">
              <div>{renderHome()}</div>
              {renderHomeDesktopRail()}
            </div>
          ) : (
            <div>{renderActiveView()}</div>
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 p-2 flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 px-2 py-1 ${activeTab === item.id ? 'text-[#7c4dff]' : 'text-gray-400'}`}
          >
            <item.icon size={18} />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default NewStudentFrontend;
