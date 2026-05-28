import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Star, 
  Award, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2, 
  Search, 
  ThumbsUp, 
  Heart, 
  LogOut, 
  MessageSquare, 
  Info, 
  ChevronRight, 
  Coins, 
  Clock,
  User,
  Users,
  AlertCircle,
  TrendingUp,
  FileText,
  Bookmark,
  Sparkle,
  Layers,
  HelpCircle,
  BookOpen,
  Bell,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Sub-components
import Banner from './components/Banner';
import ClassLeaderboard from './components/ClassLeaderboard';
import AppreciationForm from './components/AppreciationForm';
import CharacterQuiz from './components/CharacterQuiz';
import AiConsultant from './components/AiConsultant';
import RewardsShop from './components/RewardsShop';
import RecentLogs from './components/RecentLogs';
import BkControls from './components/BkControls';
import AdminControls from './components/AdminControls';

import { UserRole, User as BaseUser, Class, Log, EthicGuide, Reward, DailyReminder, QuizQuestion } from './types';

interface AuthUser extends BaseUser {
  className?: string;
}

export const getAvatarColorClass = (color?: string) => {
  switch (color) {
    case 'emerald': return 'from-emerald-500 to-emerald-600';
    case 'rose': return 'from-rose-500 to-rose-600';
    case 'amber': return 'from-amber-500 to-amber-600';
    case 'violet': return 'from-violet-500 to-violet-600';
    case 'blue': return 'from-blue-500 to-blue-600';
    case 'indigo':
    default: return 'from-indigo-500 to-indigo-600';
  }
};

export const DigiGloryHubIcon = ({ className = "w-8 h-8", color = "#007BFF" }: { className?: string, color?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path 
      fillRule="evenodd" 
      clipRule="evenodd" 
      d="M 50.8 14.2 C 70.4 14.2 86.2 30.1 86.2 49.7 C 86.2 69.3 70.4 85.2 50.8 85.2 C 43.1 85.2 36 82.8 30.1 78.6 L 30.1 63.8 C 35.8 68.3 43 71.1 50.8 71.1 C 62.6 71.1 72.2 61.5 72.2 49.7 C 72.2 37.9 62.6 28.3 50.8 28.3 C 41.5 28.3 33.6 34.3 30.7 42.6 L 15.6 42.6 C 18.9 26.1 33.4 14.2 50.8 14.2 Z" 
      fill={color} 
    />
    <rect x="18" y="55" width="10.5" height="10.5" fill={color} />
    <rect x="29" y="66" width="13.5" height="13.5" fill={color} />
    <rect x="39.5" y="49" width="15" height="15" fill={color} />
  </svg>
);

export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Core synchronized application state
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [ethicGuides, setEthicGuides] = useState<EthicGuide[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [reminders, setReminders] = useState<DailyReminder[]>([]);
  const [quizList, setQuizList] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editAvatarEmoji, setEditAvatarEmoji] = useState('✨');
  const [editAvatarColor, setEditAvatarColor] = useState('indigo');
  const [editAvatarImage, setEditAvatarImage] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const handleImageFileChange = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileErrorMsg('File harus berupa berkas gambar (PNG, JPG, dll).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileErrorMsg('Ukuran berkas gambar maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setEditAvatarImage(reader.result);
        setProfileErrorMsg('');
      } else {
        setProfileErrorMsg('Gagal membaca berkas gambar.');
      }
    };
    reader.onerror = () => {
      setProfileErrorMsg('Gagal membaca berkas gambar.');
    };
    reader.readAsDataURL(file);
  };

  const startEditingProfile = () => {
    if (!currentUser) return;
    setEditName(currentUser.name);
    setEditBio(currentUser.bio || '');
    setEditPassword('');
    setEditAvatarEmoji(currentUser.avatarEmoji || (currentUser.role === 'siswa' ? '✨' : '🎓'));
    setEditAvatarColor(currentUser.avatarColor || 'indigo');
    setEditAvatarImage(currentUser.avatarImage || '');
    setIsEditingProfile(true);
    setProfileErrorMsg('');
    setProfileSuccessMsg('');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!editName.trim()) {
      setProfileErrorMsg('Nama lengkap tidak boleh kosong.');
      return;
    }
    setIsSavingProfile(true);
    setProfileErrorMsg('');
    setProfileSuccessMsg('');
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          name: editName,
          bio: editBio,
          password: editPassword,
          avatarEmoji: editAvatarEmoji,
          avatarColor: editAvatarColor,
          avatarImage: editAvatarImage
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setProfileSuccessMsg('Profil berhasil diperbarui!');
        setCurrentUser(prev => prev ? {
          ...prev,
          name: result.user.name,
          bio: result.user.bio,
          avatarEmoji: result.user.avatarEmoji,
          avatarColor: result.user.avatarColor,
          avatarImage: result.user.avatarImage
        } : null);
        await fetchData();
        setTimeout(() => {
          setIsEditingProfile(false);
          setProfileSuccessMsg('');
        }, 1500);
      } else {
        setProfileErrorMsg(result.error || 'Gagal memperbarui profil.');
      }
    } catch (err) {
      setProfileErrorMsg('Gagal terhubung ke server.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Active Tab/Scene selection
  const [activeTab, setActiveTab] = useState<'beranda' | 'apresiasi' | 'panduan' | 'kuis' | 'toko' | 'profil'>('beranda');

  // Notifications drawer state
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setClasses(data.classes || []);
        setLogs(data.logs || []);
        setEthicGuides(data.ethicGuides || []);
        setRewards(data.rewards || []);
        setReminders(data.reminders || []);
        setQuizList(data.quizzes || []);
      }
    } catch (e) {
      console.error("Gagal terhubung ke API Server.", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const freshMe = users.find(u => u.id === currentUser.id);
      if (freshMe) {
        setCurrentUser({
          ...freshMe,
          className: classes.find(c => c.id === freshMe.kelasId)?.name || 'Sekolah'
        });
      }
    }
  }, [users, classes]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !passwordInput.trim()) {
      setAuthError('Mohon isi Username dan Kata Sandi.');
      return;
    }
    setAuthError('');
    setIsLoggingIn(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setCurrentUser(result.user);
        setUsernameInput('');
        setPasswordInput('');
        fetchData();
      } else {
        setAuthError(result.message || 'Gagal masuk ke sistem.');
      }
    } catch (err) {
      setAuthError('Gagal terhubung ke server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('beranda');
  };

  // Student peer appreciation submission callback
  const handlePeerAppreciationSubmit = async (targetStudentId: string, description: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const response = await fetch('/api/logs/apresiasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          targetStudentId,
          description,
          giverName: currentUser.name
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        fetchData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // BK - Give / update point callback
  const handleBkGivePoints = async (studentId: string, type: 'sopan' | 'bersih', points: number, description: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/points/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          type,
          points,
          description,
          giverName: currentUser.name || 'Guru BK'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // BK - Verify peer approval
  const handleVerifyLog = async (logId: string, isApproved: boolean) => {
    try {
      const res = await fetch('/api/logs/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId, isApproved })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin - Add Class
  const handleAddClass = async (name: string, waliKelasName: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/classes/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, waliKelasName })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // Admin - Add Student User
  const handleAddStudent = async (username: string, name: string, role: UserRole, kelasId: string, password = '123', bio = ''): Promise<boolean> => {
    try {
      const res = await fetch('/api/students/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, role, kelasId, password, bio })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchData();
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // Admin - Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
    try {
      const res = await fetch('/api/students/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Student - Redeem coins
  const handleRedeemReward = async (rewardId: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, rewardId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(`Selamat! Berhasil menukar merchandise: ${data.reward.title}. Silakan konfirmasi klaim di kantor BK.`);
        fetchData();
        return true;
      } else {
        alert(data.error || 'Gagal menukar reward.');
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  const totalPoints = currentUser ? (currentUser.pointSopan + currentUser.pointBersih) : 0;

  // Active navigation items mapping dynamically according to role
  const studentTabs = [
    { key: 'beranda', label: 'Dasbor Utama', icon: Home },
    { key: 'apresiasi', label: 'Saling-Asih', icon: Heart },
    { key: 'panduan', label: 'BK Virtual AI', icon: MessageSquare },
    { key: 'kuis', label: 'Kuis Etika', icon: HelpCircle },
    { key: 'toko', label: 'Tukar Reward', icon: Coins },
    { key: 'profil', label: 'Profil Saya', icon: User }
  ] as const;

  const bkTabs = [
    { key: 'beranda', label: 'Manajemen Poin', icon: Home },
    { key: 'panduan', label: 'BK Virtual AI', icon: MessageSquare },
    { key: 'profil', label: 'Profil Guru BK', icon: User }
  ] as const;

  const adminTabs = [
    { key: 'beranda', label: 'Kontrol Sekolah', icon: Home },
    { key: 'panduan', label: 'BK Virtual AI', icon: MessageSquare },
    { key: 'profil', label: 'Profil Admin', icon: User }
  ] as const;

  const activeTabsList = currentUser ? (
    currentUser.role === 'admin' ? adminTabs :
    currentUser.role === 'guru_bk' ? bkTabs : studentTabs
  ) : [];

  const mockAlerts = [
    { id: 1, title: '🏆 Peringkat Kelas Terdisiplin', text: 'Kelas VIII A berhasil menembus Posisi #1 Kebersihan dengan total 945 Poin!' },
    { id: 2, title: '🧹 Piket Kelas Terkonfirmasi', text: 'Poin Bersih Kelas bertambah +15 setelah dinilai ramah asri oleh Wali Kelas Rina.' },
    { id: 3, title: '📚 Kuis Baru Tersedia', text: 'Materi Kuis Karakter & Sopan Santun Pekan ini telah terbit. Raih bonus +20 Poin gratis!' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800 antialiased font-sans pb-16 md:pb-0">
      
      {/* Primary Global Sticky Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-100 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50/50 p-1.5 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
            <DigiGloryHubIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-black tracking-wider text-slate-900 uppercase leading-none font-mono">
                Respect Meter <span className="text-blue-600 font-sans font-black">Sekolah</span>
              </h1>
              <span className="hidden sm:inline bg-blue-50 text-blue-700 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase lg:block tracking-wide">Respect Portal v1.3</span>
            </div>
            <p className="hidden md:block text-[10px] text-slate-400 font-sans mt-0.5 font-medium">Sistem Gamifikasi Penumbuhan Karakter Terpadu Sekolah</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5 sm:gap-4 relative">
              {/* Notifications bell dropdown selector */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-450 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition duration-200 relative"
                  title="Pemberitahuan"
                >
                  <Bell className="w-4.5 h-4.5" />
                  <span className="absolute top-[3px] right-[3px] bg-rose-500 text-white text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center font-black">
                    {mockAlerts.length}
                  </span>
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowNotifications(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2.5 w-80 bg-white rounded-2xl shadow-xl border border-slate-100/80 p-4 z-50 flex flex-col gap-3"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h4 className="font-extrabold text-slate-800 text-xs">Pemberitahuan Terkini ({mockAlerts.length})</h4>
                          <button 
                            onClick={() => setShowNotifications(false)}
                            className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-2 py-0.5 rounded-md"
                          >
                            Tutup
                          </button>
                        </div>
                        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                          {mockAlerts.map(alert => (
                            <div key={alert.id} className="p-2.5 bg-indigo-50/45 rounded-xl border border-indigo-100/40 text-left">
                              <p className="font-extrabold text-indigo-950 text-xs mb-0.5">{alert.title}</p>
                              <p className="text-slate-600 text-[11px] leading-relaxed font-sans">{alert.text}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Logged in User Profile Info element */}
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-black text-slate-800 tracking-tight leading-none max-w-[120px] truncate">{currentUser.name}</span>
                  <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded mt-0.5 uppercase self-end tracking-wider">
                    {currentUser.role === 'admin' ? 'Admin' : 
                     currentUser.role === 'guru_bk' ? 'Guru BK' : 
                     currentUser.role === 'wali_kelas' ? 'Wali Kelas' : `Siswa`}
                  </span>
                </div>
                <div className={`w-8.5 h-8.5 rounded-xl bg-gradient-to-tr ${getAvatarColorClass(currentUser.avatarColor)} text-white flex items-center justify-center font-bold text-xs shadow-sm uppercase shrink-0 overflow-hidden`}>
                  {currentUser.avatarImage ? (
                    <img src={currentUser.avatarImage} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    currentUser.avatarEmoji || currentUser.name.charAt(0)
                  )}
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition duration-200 text-xs font-bold font-sans flex items-center gap-1.5 shrink-0"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden leading-none sm:inline mt-[1px]">Keluar</span>
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Menunggu Autentikasi
            </span>
          )}
        </div>
      </header>

      {/* Main Container Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-start">
        
        {!currentUser ? (
          /* Premium Elegant Split-Screen Authentication Form */
          <div className="max-w-5xl w-full mx-auto py-6 sm:py-12 lg:py-16 grid grid-cols-1 md:grid-cols-12 gap-0 rounded-3xl overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-100/30">
            {/* Left Column: Brand/Vision panel */}
            <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.18),transparent_55%)]" />
              <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl" />
              
              {/* Logo in left vision panel */}
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-8">
                  <div className="bg-white/10 p-2 rounded-xl border border-white/10 backdrop-blur-md">
                    <DigiGloryHubIcon className="w-8 h-8" color="#3B82F6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black tracking-widest text-slate-350 uppercase leading-none font-sans">Respect Meter</p>
                    <p className="text-sm font-black tracking-wider text-white uppercase leading-none mt-1 font-mono">Sekolah</p>
                  </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  Membina Karakter Unggul & Bermartabat
                </h2>
                <p className="text-xs text-slate-350 mt-3 leading-relaxed font-sans">
                  Sinergi penunjang akhlak terpuji, sopan santun, budaya bersih, dan iklim belajar yang harmonis bebas perundungan.
                </p>
              </div>

              {/* Character points feature checklist */}
              <div className="relative z-10 my-8 flex flex-col gap-3.5 border-y border-white/10 py-6">
                {[
                  { text: "Poin Sopan & Santun Terstruktur", desc: "Penilaian karakter perilaku harian siswa." },
                  { text: "Kampanye Hijau & Budaya Bersih", desc: "Aksi nyata merawat asri lingkungan sekolah." },
                  { text: "Dashboard Gamifikasi & Kuis Virtual", desc: "Kuis virtual interaktif penambah poin budi pekerti." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start">
                    <span className="text-emerald-400 font-bold mt-0.5 mt-[2px]">✓</span>
                    <div>
                      <p className="text-xs font-extrabold text-slate-100 font-sans leading-none">{item.text}</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal font-sans">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Version watermark footprint */}
              <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-500 font-mono pt-4 border-t border-white/5">
                <span>DIGI RESPECT • v1.3</span>
                <span>SECURED SERVER</span>
              </div>
            </div>

            {/* Right Column: Dynamic elegant Login Form panel */}
            <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white relative">
              <div className="max-w-md w-full mx-auto">
                <div className="mb-6">
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full font-sans inline-block">
                    Gerbang Autentikasi
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-3">Silahkan Masuk Akun</h2>
                  <p className="text-xs text-slate-400 mt-1 font-sans">Gunakan akun terdaftar untuk mengelola atau memantau tabungan poin karakter.</p>
                </div>

                {authError && (
                  <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-100 flex items-center gap-2.5 mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 font-sans">Nama Pengguna (Username)</label>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Masukkan nama pengguna..."
                      className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 font-medium transition duration-150"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider font-sans">Kata Sandi (Password)</label>
                      <span className="text-[10px] text-slate-400 font-medium cursor-help" title="Minta bantuan administrator jika lupa sandi Anda">Lupa Sandi?</span>
                    </div>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Masukkan kata sandi..."
                      className="w-full px-4 py-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50 font-medium transition duration-150"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3 px-4 rounded-xl transition duration-150 shadow-md shadow-blue-100 flex items-center justify-center text-xs disabled:bg-slate-300 mt-2 tracking-wide uppercase font-sans"
                  >
                    {isLoggingIn ? 'Memproses Masuk...' : 'Masuk Dashboard'}
                  </button>
                </form>

                {/* DEMO ACCOUNTS ACCORDION GRID */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block mb-3 font-sans">
                    🚀 Akun Demonstrasi Uji Coba:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setUsernameInput('aurelia');
                        setPasswordInput('123');
                      }}
                      className="p-3 bg-blue-50/20 hover:bg-blue-50/60 rounded-xl border border-blue-100/60 text-left transition duration-150 group"
                    >
                      <p className="font-extrabold text-blue-950 text-xs flex items-center justify-between">
                        <span>Siswa</span>
                        <span className="text-[8px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-black group-hover:bg-blue-200">Gunakan</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 select-all">User: aurelia &bull; Sandi: 123</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setUsernameInput('bk');
                        setPasswordInput('123');
                      }}
                      className="p-3 bg-indigo-50/20 hover:bg-indigo-50/60 rounded-xl border border-indigo-100/60 text-left transition duration-150 group"
                    >
                      <p className="font-extrabold text-indigo-950 text-xs flex items-center justify-between">
                        <span>Guru BK</span>
                        <span className="text-[8px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-black group-hover:bg-indigo-200">Gunakan</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-1 select-all">User: bk &bull; Sandi: 123</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* UNIFIED RESPONSIVE APP SHELL */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
            
            {/* LEFT COLUMN: DESKTOP PERSISTENT NAVIGATION SIDEBAR */}
            <div className="hidden md:flex md:col-span-4 lg:col-span-3 flex-col gap-5 sticky top-24 select-none">
              
              {/* User overview mini card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${getAvatarColorClass(currentUser.avatarColor)} text-white flex items-center justify-center font-black text-base uppercase shrink-0 overflow-hidden`}>
                    {currentUser.avatarImage ? (
                      <img src={currentUser.avatarImage} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      currentUser.avatarEmoji || currentUser.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-xs leading-none">{currentUser.name}</h4>
                    <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-extrabold uppercase mt-1 inline-block">
                      {currentUser.role === 'siswa' ? `Kelas ${currentUser.className}` : currentUser.role}
                    </span>
                  </div>
                </div>

                {currentUser.role === 'siswa' && (
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                      <span className="block text-[8px] text-slate-400 font-bold uppercase">Sopantun</span>
                      <span className="block font-black font-mono text-[11px] text-indigo-755 mt-0.5">{currentUser.pointSopan} pts</span>
                    </div>
                    <div className="bg-slate-50/60 p-2 rounded-xl border border-slate-100">
                      <span className="block text-[8px] text-slate-400 font-bold uppercase">Kebersihan</span>
                      <span className="block font-black font-mono text-[11px] text-indigo-755 mt-0.5">{currentUser.pointBersih} pts</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Tabs */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest px-2 mb-2">Pilar Navigasi</span>
                {activeTabsList.map(tab => {
                  const isSel = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition duration-200 flex items-center justify-between ${
                        isSel
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-150'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <tab.icon className={`w-4 h-4 shrink-0 ${isSel ? 'text-white' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 transition duration-150 ${isSel ? 'text-white opacity-90' : 'text-slate-350 opacity-50'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Character Quote helper in Sidebar */}
              {currentUser.role === 'siswa' && (
                <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-4 -mt-4" />
                  <p className="text-[11px] italic text-indigo-100/90 leading-relaxed relative z-10">
                    "{currentUser.bio || 'Menjadi teladan kebaikan merupakan langkah awal menggapai karunia karsa agung sekolah.'}"
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: MAIN INTERACTIVE VIEW AREA */}
            <div className="col-span-1 md:col-span-8 lg:col-span-9 w-full flex flex-col gap-6">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  
                  {/* TAB: BERANDA */}
                  {activeTab === 'beranda' && (
                    <div className="flex flex-col gap-6">
                      
                      {/* Dashboard Bento Jumbotron welcomed card */}
                      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white p-6 rounded-3xl shadow-md border border-indigo-950 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Grid decorative pattern */}
                        <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-5 pointer-events-none" />
                        
                        <div className="relative z-10 flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center font-black text-xl text-indigo-100 shadow-sm shrink-0">
                            {currentUser.role === 'siswa' ? '🏆' : '💼'}
                          </div>
                          <div>
                            <p className="text-[10px] text-indigo-300 uppercase font-extrabold tracking-widest leading-none">Dasbor Utama Portal</p>
                            <h4 className="text-base sm:text-lg font-black text-white leading-tight mt-1">{currentUser.name}</h4>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              <span className="bg-indigo-600/80 border border-indigo-500/30 text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-extrabold">
                                {currentUser.role === 'siswa' ? `Kelas ${currentUser.className}` : `Akses ${currentUser.role.toUpperCase()}`}
                              </span>
                              {currentUser.role === 'siswa' && currentUser.badges && currentUser.badges.length > 0 && (
                                <span className="bg-purple-600/50 text-purple-100 text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1">
                                  🎖️ {currentUser.badges.length} Lencana
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {currentUser.role === 'siswa' && (
                          <div className="relative z-10 flex items-center gap-3 shrink-0">
                            <div className="bg-white/10 backdrop-blur-md border border-white/5 p-3 rounded-2xl text-center min-w-[95px]">
                              <span className="block text-[9px] uppercase tracking-wider text-indigo-200 font-extrabold">Sopan Santun</span>
                              <span className="block font-black text-sm sm:text-base font-mono text-white mt-0.5">{currentUser.pointSopan} Pts</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md border border-white/5 p-3 rounded-2xl text-center min-w-[95px]">
                              <span className="block text-[9px] uppercase tracking-wider text-indigo-200 font-extrabold">Kerapian/Bersih</span>
                              <span className="block font-black text-sm sm:text-base font-mono text-white mt-0.5">{currentUser.pointBersih} Pts</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Event Banner Section */}
                      <Banner />

                      {/* Quick Activity Navigator grids underneath Welcome Section for Student */}
                      {currentUser.role === 'siswa' && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <button onClick={() => setActiveTab('apresiasi')} className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-3xs hover:shadow-2xs hover:bg-slate-50/50 hover:border-slate-200 text-left transition duration-200 group">
                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-all">💝</div>
                            <div>
                              <h5 className="font-extrabold text-slate-800 text-xs leading-none">Saling-Asih</h5>
                              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">Nilai akhlak teman</p>
                            </div>
                          </button>
                          <button onClick={() => setActiveTab('kuis')} className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-3xs hover:shadow-2xs hover:bg-slate-50/50 hover:border-slate-200 text-left transition duration-200 group">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-all">🌟</div>
                            <div>
                              <h5 className="font-extrabold text-slate-800 text-xs leading-none">Kuis Etika</h5>
                              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">Tes nalar moral BK</p>
                            </div>
                          </button>
                          <button onClick={() => setActiveTab('toko')} className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-3xs hover:shadow-2xs hover:bg-slate-50/50 hover:border-slate-200 text-left transition duration-200 group">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-all">🎁</div>
                            <div>
                              <h5 className="font-extrabold text-slate-800 text-xs leading-none">Tukar Koin</h5>
                              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">Merchandise sekolah</p>
                            </div>
                          </button>
                          <button onClick={() => setActiveTab('panduan')} className="flex items-center gap-3 p-3.5 bg-white rounded-2xl border border-slate-100 shadow-3xs hover:shadow-2xs hover:bg-slate-50/50 hover:border-slate-200 text-left transition duration-200 group">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-all">📖</div>
                            <div>
                              <h5 className="font-extrabold text-slate-800 text-xs leading-none">BK Virtual</h5>
                              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">AI panduan karakter</p>
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Main Dynamic Workspace Columns for Student role */}
                      {currentUser.role === 'siswa' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                          <div className="lg:col-span-7 flex flex-col gap-6">
                            <RecentLogs logs={logs} />
                          </div>
                          <div className="lg:col-span-5">
                            <ClassLeaderboard classes={classes} />
                          </div>
                        </div>
                      )}

                      {/* BK Counselor Controls Wrapper */}
                      {currentUser.role === 'guru_bk' && (
                        <BkControls 
                          users={users}
                          classes={classes}
                          logs={logs}
                          currentUser={currentUser}
                          onVerifyLog={handleVerifyLog}
                          onGivePoint={handleBkGivePoints}
                        />
                      )}

                      {/* Admin School Controls Wrapper */}
                      {currentUser.role === 'admin' && (
                        <AdminControls
                          users={users}
                          classes={classes}
                          currentUser={currentUser}
                          onAddClass={handleAddClass}
                          onAddStudent={handleAddStudent}
                          onDeleteUser={handleDeleteUser}
                        />
                      )}
                    </div>
                  )}

                  {/* TAB: APRESIASI (Saling-Asih) */}
                  {activeTab === 'apresiasi' && currentUser.role === 'siswa' && (
                    <div className="flex flex-col gap-6">
                      <AppreciationForm 
                        users={users}
                        currentUser={currentUser}
                        onSubmit={handlePeerAppreciationSubmit}
                      />
                      <RecentLogs logs={logs.filter(l => l.studentId === currentUser.id || l.description.includes(currentUser.name))} />
                    </div>
                  )}

                  {/* TAB: PANDUAN (BK Virtual & Pedoman) */}
                  {activeTab === 'panduan' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                            Pedoman Karakter, Akhlak & Sopan Santun
                          </h3>
                          <p className="text-xs text-slate-500 font-sans mt-1">
                            Standar kesopanan umum untuk melahirkan generasi penerus bangsa yang santun, tertib, dan asri.
                          </p>
                        </div>

                        <div className="flex flex-col gap-4">
                          {ethicGuides.map(guide => (
                            <div key={guide.id} className="border-b border-indigo-50/50 pb-4 last:border-0 last:pb-0">
                              <span className="bg-indigo-50 text-indigo-750 text-[10px] font-bold px-2 py-0.5 rounded-lg mb-1 inline-block uppercase font-mono">
                                {guide.category}
                              </span>
                              <h4 className="font-extrabold text-slate-800 text-xs mt-0.5">{guide.title}</h4>
                              <p className="text-[11px] text-slate-600 leading-relaxed font-sans mt-1.5">{guide.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="lg:col-span-5">
                        <AiConsultant currentUser={currentUser} />
                      </div>
                    </div>
                  )}

                  {/* TAB: KUIS */}
                  {activeTab === 'kuis' && currentUser.role === 'siswa' && (
                    <CharacterQuiz 
                      quizList={quizList}
                      currentUser={currentUser}
                      onQuizSuccess={fetchData}
                    />
                  )}

                  {/* TAB: TOKO */}
                  {activeTab === 'toko' && currentUser.role === 'siswa' && (
                    <RewardsShop 
                      rewards={rewards}
                      currentUser={currentUser}
                      onRedeem={handleRedeemReward}
                    />
                  )}

                  {/* TAB: PROFIL */}
                  {activeTab === 'profil' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      {!isEditingProfile ? (
                        <>
                          {/* Personal bio card */}
                          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center">
                            <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${getAvatarColorClass(currentUser.avatarColor)} text-white flex items-center justify-center font-black text-2xl uppercase shadow-lg shadow-indigo-100 mb-4 shrink-0 overflow-hidden`}>
                              {currentUser.avatarImage ? (
                                <img src={currentUser.avatarImage} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                currentUser.avatarEmoji || (currentUser.name ? currentUser.name.charAt(0) : '?')
                              )}
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-base">{currentUser.name}</h4>
                            <p className="text-xs text-slate-400 font-mono mt-1 select-all">Nama Pengguna: {currentUser.username}</p>
                            
                            <div className="mt-3.5 bg-indigo-50 text-indigo-755 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                              {currentUser.role === 'admin' ? 'Administrator Sekolah' : 
                               currentUser.role === 'guru_bk' ? 'Guru BK Sinergi' : 
                               currentUser.role === 'wali_kelas' ? 'Wali Kelas Terhormat' : `Siswa Aktif (${currentUser.className})`}
                            </div>

                            <p className="text-xs text-slate-400 italic mt-4 leading-relaxed max-w-sm">
                              "{currentUser.bio || 'Membangun karakter mulia demi hari esok yang santun, disiplin, dan asri.'}"
                            </p>

                            <button 
                              onClick={startEditingProfile} 
                              className="w-full mt-5 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 text-xs font-bold py-2.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-1.5"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              <span>Ubah Profil & Lambang</span>
                            </button>

                            <button 
                              onClick={handleLogout} 
                              className="w-full mt-2.5 border border-rose-100 hover:bg-rose-50 text-rose-600 text-xs font-bold py-2.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-1.5"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Keluar Akun (Logout)</span>
                            </button>
                          </div>

                          {/* Stats and badges */}
                          <div className="lg:col-span-7 flex flex-col gap-6">
                            {currentUser.role === 'siswa' && (
                              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
                                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                                  <Trophy className="w-4 h-4 text-indigo-600" />
                                  Lencana Kompetensi Tersemat
                                </h4>
                                {currentUser.badges && currentUser.badges.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                                    {currentUser.badges.map((badge, idx) => (
                                      <div key={idx} className="p-3 bg-gradient-to-tr from-amber-50 to-orange-50 rounded-xl border border-amber-100 flex items-center gap-2.5">
                                        <span className="text-lg">🏅</span>
                                        <div>
                                          <p className="font-extrabold text-slate-850 text-xs">{badge}</p>
                                          <p className="text-[10px] text-amber-600 mt-0.5 leading-none">Terverifikasi Guru BK</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="p-6 bg-slate-50/50 rounded-xl text-center border border-dashed border-slate-200">
                                    <p className="text-xs text-slate-400">Belum ada lencana karakter tersemat. Terus kembangkan budi pekerti yang santun!</p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Point summary block */}
                            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col gap-4">
                              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-slate-400 font-mono">
                                Prasasti Tabungan Karakter
                              </h4>
                              <div className="grid grid-cols-3 gap-3 text-center animate-none">
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/60">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Poin Santun</span>
                                  <span className="block font-black font-mono text-base text-slate-850 mt-1">{currentUser.pointSopan || 0}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/60">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Poin Bersih</span>
                                  <span className="block font-black font-mono text-base text-slate-850 mt-1">{currentUser.pointBersih || 0}</span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100/60">
                                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Apresiasi</span>
                                  <span className="block font-black font-mono text-base text-slate-850 mt-1">{currentUser.apresiasiDiterima || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <form onSubmit={handleUpdateProfile} className="col-span-1 lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 select-none">
                          {/* Profile Preview Column */}
                          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4 block font-sans">Pratinjau Lambang</span>
                            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${getAvatarColorClass(editAvatarColor)} text-white flex items-center justify-center font-black text-3xl uppercase shadow-lg mb-4 shrink-0 transition-all duration-300 overflow-hidden`}>
                              {editAvatarImage ? (
                                <div className="relative w-full h-full group">
                                  <img src={editAvatarImage} alt="Avatar Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  <button
                                    type="button"
                                    onClick={() => setEditAvatarImage('')}
                                    className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] uppercase font-bold tracking-wider transition-opacity duration-200"
                                    title="Hapus gambar & gunakan simbol"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              ) : (
                                editAvatarEmoji || editName.charAt(0) || '?'
                              )}
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-base leading-tight truncate w-full">{editName || 'Nama Belum Diisi'}</h4>
                            <p className="text-xs text-slate-400 font-mono mt-1 select-all">Nama Pengguna: {currentUser.username}</p>
                            <p className="text-xs text-slate-450 italic mt-4 leading-relaxed max-w-sm font-sans bg-slate-50 p-3 rounded-xl border border-slate-100/85 w-full">
                              "{editBio || 'Belum ada ulasan bio pribadi...'}"
                            </p>
                          </div>

                          {/* Profile Edit Fields Column */}
                          <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
                            <div>
                              <h3 className="font-extrabold text-slate-950 text-base font-sans">Sesuaikan Identitas & Profil</h3>
                              <p className="text-xs text-slate-400 font-sans">Silahkan perbarui nama lengkap, bio, sandi, serta warna lambang karakter Anda di bawah ini.</p>
                            </div>

                            {profileSuccessMsg && (
                              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-xs font-bold font-sans flex items-center gap-2">
                                <span className="text-base leading-none">✅</span>
                                <span>{profileSuccessMsg}</span>
                              </div>
                            )}

                            {profileErrorMsg && (
                              <div className="p-3 bg-rose-50 text-rose-750 border border-rose-100 rounded-xl text-xs font-bold font-sans flex items-center gap-2">
                                <span className="text-base leading-none">⚠️</span>
                                <span>{profileErrorMsg}</span>
                              </div>
                            )}

                            <div className="flex flex-col gap-4">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans mb-1.5">Nama Lengkap</label>
                                  <input 
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Masukkan nama lengkap Anda"
                                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:border-indigo-500 transition font-bold"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans mb-1.5">Ubah Sandi Baru (Opsional)</label>
                                  <input 
                                    type="password"
                                    value={editPassword}
                                    onChange={(e) => setEditPassword(e.target.value)}
                                    placeholder="Isi jika ingin ganti kata sandi"
                                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:border-indigo-500 transition font-bold"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans mb-1.5">Bio / Slogan Karakter</label>
                                <textarea 
                                  value={editBio}
                                  onChange={(e) => setEditBio(e.target.value)}
                                  placeholder="Tuliskan motivasi belajar atau ulasan budi pekerti Anda..."
                                  rows={2}
                                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:border-indigo-500 transition resize-none leading-relaxed font-sans"
                                />
                              </div>

                              {/* Emoji choice grid */}
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans mb-2">Simbol Karakter (Avatar Emoji)</label>
                                <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
                                  {["✨", "⭐", "🏆", "🎓", "🚀", "🔥", "🍀", "📚", "🎨", "🌟", "🐱", "🦁"].map(emoji => {
                                    const isSel = editAvatarEmoji === emoji;
                                    return (
                                      <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setEditAvatarEmoji(emoji)}
                                        className={`h-10 w-10 text-xl flex items-center justify-center rounded-xl border transition ${isSel ? 'bg-indigo-50 border-indigo-500 scale-110 shadow-sm font-bold' : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/50'}`}
                                      >
                                        {emoji}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Color choice grid */}
                              <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans mb-2">Warna Latar Lambang</label>
                                <div className="flex flex-wrap gap-3">
                                  {[
                                    { id: 'indigo', hex: 'bg-indigo-500' },
                                    { id: 'emerald', hex: 'bg-emerald-500' },
                                    { id: 'rose', hex: 'bg-rose-500' },
                                    { id: 'amber', hex: 'bg-amber-500' },
                                    { id: 'blue', hex: 'bg-blue-500' },
                                    { id: 'violet', hex: 'bg-violet-500' },
                                  ].map(color => {
                                    const isSel = editAvatarColor === color.id;
                                    return (
                                      <button
                                        key={color.id}
                                        type="button"
                                        onClick={() => setEditAvatarColor(color.id)}
                                        className={`h-7 w-7 rounded-full ${color.hex} relative border border-white transition flex items-center justify-center shadow-xs ${isSel ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-105 opacity-80'}`}
                                        title={color.id}
                                      >
                                        {isSel && <span className="text-white text-[10px]">✓</span>}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Custom Profile Image upload */}
                              <div className="pt-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-sans mb-2">Pasang Foto Profil Kustom (Mendukung Seret & Lepas)</label>
                                <div
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDraggingFile(true);
                                  }}
                                  onDragLeave={() => {
                                    setIsDraggingFile(false);
                                  }}
                                  onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDraggingFile(false);
                                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                      handleImageFileChange(e.dataTransfer.files[0]);
                                    }
                                  }}
                                  onClick={() => {
                                    document.getElementById('avatar-file-input')?.click();
                                  }}
                                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-250 ${
                                    isDraggingFile 
                                      ? 'border-indigo-500 bg-indigo-50/50' 
                                      : 'border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100/50'
                                  }`}
                                >
                                  <input 
                                    id="avatar-file-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        handleImageFileChange(e.target.files[0]);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                  <div className="flex flex-col items-center gap-1.5">
                                    <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs font-bold text-slate-700">
                                      {editAvatarImage ? '✓ Foto Berhasil Dimuat' : 'Pilih Foto dari Berkas atau Seret ke Sini'}
                                    </span>
                                    <span className="text-[10px] text-slate-450">
                                      Mendasari format JPEG, PNG, WEBP sampai 2 MB
                                    </span>
                                  </div>
                                </div>
                                {editAvatarImage && (
                                  <div className="flex items-center justify-between mt-2.5 px-3 py-2 bg-indigo-50/40 rounded-xl border border-indigo-100/40">
                                    <div className="flex items-center gap-2">
                                      <img src={editAvatarImage} alt="Mini preview" className="w-8 h-8 rounded-lg object-cover border border-indigo-200/50 shrink-0" referrerPolicy="no-referrer" />
                                      <span className="text-[11px] font-bold text-indigo-755">Foto Kustom Karakter Berhasil Terpasang</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => setEditAvatarImage('')}
                                      className="text-xs text-rose-600 hover:text-rose-750 font-bold px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 transition"
                                    >
                                      Hapus Foto
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                              <button
                                type="submit"
                                disabled={isSavingProfile}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-350 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 font-sans"
                              >
                                {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditingProfile(false)}
                                disabled={isSavingProfile}
                                className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs rounded-xl transition font-sans"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>

            </div>
          </div>
        )}

      </div>

      {/* MOBILE STICKY BOTTOM TOOLBAR NAVIGATION (Visible only on smartphone viewports) */}
      {currentUser && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 h-16 bg-white border-t border-slate-200 z-50 flex items-center justify-around px-2 shadow-lg pb-safe">
          {activeTabsList.map(tab => {
            const isSel = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as any);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex flex-col items-center justify-center gap-0.5 transition duration-150 flex-1 relative ${
                  isSel ? 'text-indigo-650 scale-105' : 'text-slate-400 hover:text-slate-650'
                }`}
              >
                <tab.icon className={`w-4.5 h-4.5 shrink-0 ${isSel ? 'text-indigo-650 font-bold' : 'text-slate-400'}`} />
                <span className="text-[9px] font-extrabold tracking-tight font-sans text-center mt-0.5 leading-none">
                  {tab.key === 'apresiasi' ? 'Saling-Asih' : 
                   tab.key === 'panduan' ? 'BK AI' : 
                   tab.key === 'kuis' ? 'Kuis' : 
                   tab.key === 'toko' ? 'Tukar' :
                   tab.key === 'profil' ? 'Profil' : 'Beranda'}
                </span>
                {isSel && (
                  <motion.div 
                    layoutId="activeTabMobileDot animate-bounce"
                    className="absolute -top-1.5 w-1 h-1 rounded-full bg-indigo-600" 
                  />
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* Footer copyright */}
      <footer className="mt-auto py-5 border-t border-slate-100 bg-white text-center text-[10px] sm:text-xs text-slate-400 font-sans flex flex-col sm:flex-row items-center justify-between px-6 sm:px-8 gap-2 shrink-0">
        <p>© 2026 Respect Meter - Sistem Gamifikasi Poin Karakter Digital Terintegrasi Sekolah Terpadu HZ DEV</p>
        <p className="font-mono text-[9px] bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-500 font-extrabold uppercase select-none">
          Local Storage Persistent DB
        </p>
      </footer>

    </div>
  );
}
