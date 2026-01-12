
import React, { useState, useEffect, useRef } from 'react';
import { 
  FaBookOpen, FaGamepad, FaShoppingBasket, FaSignOutAlt, 
  FaCoins, FaStar, FaCheck, FaTimes, FaClock, FaUser, FaMicrophone, FaBolt, FaTasks, FaTrophy, FaPlay,
  FaCloudSun, FaSun, FaCloud, FaMoon, FaCloudMoon, FaPause, FaStop, FaHeadphones, FaShoppingCart, FaCalendarAlt, FaMedal, FaGift, FaHourglassHalf, FaLock, FaExclamationCircle, FaRobot, FaMapPin, FaCalendarDay
} from 'react-icons/fa';
import { Student, MarketItem, WeeklyTask, Announcement, Badge, Surah, PendingItem, AppEvent } from '../types';
import { SURAH_LIST } from '../constants';
import QuizGame from './QuizGame';
import DuelGame from './DuelGame';

interface StudentDashboardProps {
  student: Student;
  updateStudent: (id: number, updater: (s: Student) => Student) => void;
  onLogout: () => void;
  marketItems: MarketItem[];
  tasks: WeeklyTask[];
  announcements: Announcement[];
  badges: Badge[];
  events: AppEvent[];
}

interface PrayerTime {
  id: string;
  label: string;
  time: string; // HH:mm format
  hour: number;
  minute: number;
}

interface NotificationState {
  show: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
}

export default function StudentDashboard({ 
  student, updateStudent, onLogout,
  marketItems, tasks, announcements, badges, events
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'academic' | 'ezber' | 'games' | 'market'>('home');
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState<'quiz' | 'duel' | null>(null);

  // Audio Player State
  const [playingSurahId, setPlayingSurahId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Celebration & Notification State
  const [showCelebration, setShowCelebration] = useState<Badge | null>(null);
  const prevBadgeCountRef = useRef(student.badges.length);
  const [notification, setNotification] = useState<NotificationState>({ show: false, type: 'success', title: '', message: '' });

  // Check for new badges
  useEffect(() => {
    if (student.badges.length > prevBadgeCountRef.current) {
      const newBadgeId = student.badges[student.badges.length - 1];
      const badgeObj = badges.find(b => b.id === newBadgeId);
      if (badgeObj) {
        setShowCelebration(badgeObj);
      }
    }
    prevBadgeCountRef.current = student.badges.length;
  }, [student.badges, badges]);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const parseTime = (t: string) => {
    if (!t) return { hour: 0, minute: 0 };
    const [h, m] = t.split(':').map(Number);
    return { hour: h || 0, minute: m || 0 };
  };

  useEffect(() => {
    async function fetchPrayers() {
      try {
        // API çağrısı
        const res = await fetch('https://api.aladhan.com/v1/timingsByCity?city=Istanbul&country=Turkey&method=13');
        
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const json = await res.json();
        const timings = json.data.timings;
        const mapped: PrayerTime[] = [
          { id: 'sabah', label: 'Sabah', time: timings.Fajr, ...parseTime(timings.Fajr) },
          { id: 'ogle', label: 'Öğle', time: timings.Dhuhr, ...parseTime(timings.Dhuhr) },
          { id: 'ikindi', label: 'İkindi', time: timings.Asr, ...parseTime(timings.Asr) },
          { id: 'aksam', label: 'Akşam', time: timings.Maghrib, ...parseTime(timings.Maghrib) },
          { id: 'yatsi', label: 'Yatsı', time: timings.Isha, ...parseTime(timings.Isha) },
        ];
        setPrayerTimes(mapped);
      } catch (e) {
        console.error("API error, using fallback data", e);
        // Fallback: Varsayılan (Tahmini) İstanbul Vakitleri
        const fallbackTimings = {
            Fajr: "06:00",
            Dhuhr: "13:00",
            Asr: "16:30",
            Maghrib: "19:00",
            Isha: "20:30"
        };
        const mapped: PrayerTime[] = [
          { id: 'sabah', label: 'Sabah', time: fallbackTimings.Fajr, ...parseTime(fallbackTimings.Fajr) },
          { id: 'ogle', label: 'Öğle', time: fallbackTimings.Dhuhr, ...parseTime(fallbackTimings.Dhuhr) },
          { id: 'ikindi', label: 'İkindi', time: fallbackTimings.Asr, ...parseTime(fallbackTimings.Asr) },
          { id: 'aksam', label: 'Akşam', time: fallbackTimings.Maghrib, ...parseTime(fallbackTimings.Maghrib) },
          { id: 'yatsi', label: 'Yatsı', time: fallbackTimings.Isha, ...parseTime(fallbackTimings.Isha) },
        ];
        setPrayerTimes(mapped);
      } finally {
        setLoading(false);
      }
    }
    fetchPrayers();
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const getStatus = (p: PrayerTime) => {
    const now = new Date();
    const pDate = new Date();
    pDate.setHours(p.hour, p.minute, 0, 0);

    const nextIdx = prayerTimes.findIndex(pt => pt.id === p.id) + 1;
    let nextDate: Date | null = null;
    if (nextIdx < prayerTimes.length) {
      nextDate = new Date();
      nextDate.setHours(prayerTimes[nextIdx].hour, prayerTimes[nextIdx].minute, 0, 0);
    } else {
      // After Yatsi, it's past but stays the last one until midnight
    }

    if (now < pDate) return 'locked'; // Vakti gelmedi
    if (nextDate && now >= pDate && now < nextDate) return 'current'; // Şuan bu vakit içindeyiz
    return 'past'; // Vakti geçti ama bugünün vakti, girilebilir
  };

  const togglePrayer = (pid: string, type: 'tek' | 'cemaat') => {
    const dateKey = new Date().toISOString().split('T')[0];
    const key = `${dateKey}-${pid}`;
    updateStudent(student.id, (s: Student) => {
      const current = s.prayers[key];
      if (current && current.type === type) return s; 
      const newPoints = s.namazPoints + (type === 'cemaat' ? 20 : 10);
      return {
        ...s,
        namazPoints: newPoints,
        prayers: { ...s.prayers, [key]: { type, timestamp: Date.now() } }
      };
    });
  };

  const completeTask = (task: WeeklyTask) => {
    const today = new Date();
    if (today.getDay() !== 5) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Beklemelisin',
        message: 'Görevleri sadece Cuma günü tamamlayabilirsin! 📅'
      });
      return;
    }

    if (student.completedTasks.includes(task.id)) return;
    if (student.pendingTasks?.includes(task.id)) return;
    
    updateStudent(student.id, (s) => ({
      ...s,
      pendingTasks: [...(s.pendingTasks || []), task.id]
    }));
    
    setNotification({
      show: true,
      type: 'success',
      title: 'Harika!',
      message: 'Görev onaya gönderildi.'
    });
  };

  const handleBuyItem = (item: MarketItem) => {
    // 1. Check Stock
    if (item.stock <= 0) {
      setNotification({
        show: true,
        type: 'error',
        title: 'Stok Tükendi',
        message: 'Bu ürün maalesef kalmadı.'
      });
      return;
    }

    // 2. Check if already pending
    const pendingList = student.pendingItems || [];
    const isPending = pendingList.some(p => p.itemId === item.id);
    if(isPending) {
        setNotification({
        show: true,
        type: 'error',
        title: 'Zaten Bekliyor',
        message: 'Bu ürün için zaten bir talebin var.'
      });
      return;
    }

    // 3. Check Balance & Process
    if (item.currency === 'GP') {
      if (student.points >= item.price) {
        // SUCCESS GP
        const pItem: PendingItem = {
            id: Date.now().toString(),
            itemId: item.id,
            itemTitle: item.title,
            price: item.price,
            currency: 'GP',
            timestamp: Date.now()
        };
        updateStudent(student.id, s => ({
          ...s,
          points: s.points - item.price, 
          pendingItems: [...pendingList, pItem]
        }));
        
        setNotification({
            show: true,
            type: 'success',
            title: 'Talep Alındı!',
            message: `${item.price} GP hesabından düşüldü. Onay bekleniyor.`
        });

      } else {
        // FAIL GP
        setNotification({
            show: true,
            type: 'error',
            title: 'Yetersiz Puan (GP)',
            message: `Bu ürün için ${item.price - student.points} GP daha biriktirmelisin.`
        });
      }
    } else {
      if (student.namazPoints >= item.price) {
        // SUCCESS NP
        const pItem: PendingItem = {
            id: Date.now().toString(),
            itemId: item.id,
            itemTitle: item.title,
            price: item.price,
            currency: 'NP',
            timestamp: Date.now()
        };
        updateStudent(student.id, s => ({
          ...s,
          namazPoints: s.namazPoints - item.price,
          pendingItems: [...pendingList, pItem]
        }));
        setNotification({
            show: true,
            type: 'success',
            title: 'Talep Alındı!',
            message: `${item.price} NP hesabından düşüldü. Onay bekleniyor.`
        });
      } else {
         // FAIL NP
         setNotification({
            show: true,
            type: 'error',
            title: 'Yetersiz Namaz Puanı (NP)',
            message: `Bu ürün için ${item.price - student.namazPoints} NP daha biriktirmelisin.`
        });
      }
    }
  };

  const handleGameComplete = (score: number) => {
    if (score > 0) {
      updateStudent(student.id, s => ({
        ...s,
        points: s.points + score
      }));
      setNotification({
        show: true,
        type: 'success',
        title: 'Tebrikler!',
        message: `Oyundan ${score} GP kazandın.`
      });
    }
    setActiveGame(null);
  };

  const getPrayerIcon = (id: string) => {
    switch (id) {
        case 'sabah': return <FaCloudSun />;
        case 'ogle': return <FaSun />;
        case 'ikindi': return <FaCloud />;
        case 'aksam': return <FaCloudMoon />;
        case 'yatsi': return <FaMoon />;
        default: return <FaSun />;
    }
  };

  const toggleSurahAudio = (surah: Surah) => {
    // 1. Stop existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // 2. If clicking same surah, toggle off
    if (playingSurahId === surah.id) {
      setPlayingSurahId(null);
      return;
    }
    
    // Fix for decimal numbers (e.g. 36.1 for Yasin pages) -> converts to 36 to get the full Surah mp3
    const baseNumber = Math.floor(surah.number);
    const paddedNumber = String(baseNumber).padStart(3, '0');
    const url = `https://server8.mp3quran.net/afs/${paddedNumber}.mp3`;
    
    const newAudio = new Audio(url);
    const startTime = surah.audioStartTime || 0;
    
    // Attempt to set time before playing
    newAudio.currentTime = startTime;

    const playPromise = newAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
           // Ensure seek is correct after playback starts
           if (startTime > 0 && Math.abs(newAudio.currentTime - startTime) > 1) {
              newAudio.currentTime = startTime;
           }
        })
        .catch(error => {
           // Ignore 'interrupted by pause' errors which happen during rapid switching
           if (error.name === 'AbortError' || error.message?.includes('interrupted')) {
             return;
           }
           console.error("Audio play failed", error);
        });
    }

    // Reference assignments
    audioRef.current = newAudio;
    setPlayingSurahId(surah.id);

    newAudio.addEventListener('ended', () => {
      setPlayingSurahId(null);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800 relative">
      
      {/* CUSTOM NOTIFICATION POPUP */}
      {notification.show && (
         <div className="fixed inset-0 flex items-center justify-center z-[150] pointer-events-none px-6">
            <div className={`bg-white w-full max-w-sm p-6 rounded-3xl shadow-2xl border-b-8 animate-fade-in-up flex items-center gap-4 pointer-events-auto ${notification.type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {notification.type === 'success' ? <FaCheck /> : <FaExclamationCircle />}
               </div>
               <div>
                  <h4 className={`font-black text-lg ${notification.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
                    {notification.title}
                  </h4>
                  <p className="text-sm text-slate-500 font-medium leading-tight">
                    {notification.message}
                  </p>
               </div>
            </div>
         </div>
      )}

      {/* CELEBRATION MODAL */}
      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-6">
           <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 text-center relative overflow-hidden shadow-2xl animate-fade-in-up">
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                 <div className="absolute top-10 left-10 w-3 h-3 bg-red-400 rounded-full animate-bounce"></div>
                 <div className="absolute top-20 right-10 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                 <div className="absolute bottom-10 left-20 w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
              </div>

              <div className="w-24 h-24 bg-gradient-to-tr from-yellow-300 to-amber-500 rounded-full mx-auto mb-6 flex items-center justify-center text-5xl shadow-lg border-4 border-white ring-4 ring-yellow-200">
                {showCelebration.icon}
              </div>
              
              <h2 className="text-3xl font-black text-slate-800 mb-2">Tebrikler!</h2>
              <p className="text-slate-500 font-bold mb-6">Yeni bir rozet kazandın.</p>
              
              <div className="bg-slate-50 rounded-2xl p-4 mb-8 border border-slate-100">
                 <h3 className="text-lg font-black text-indigo-600 mb-1">{showCelebration.title}</h3>
                 <p className="text-xs text-slate-400">{showCelebration.description}</p>
                 <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                   {showCelebration.value} {showCelebration.currency} Değerinde
                 </div>
              </div>

              <button 
                onClick={() => setShowCelebration(null)}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-indigo-200 hover:scale-[1.02] transition"
              >
                Harika!
              </button>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900 text-white p-6 pt-10 rounded-b-3xl shadow-2xl relative">
        <div className="absolute inset-0 overflow-hidden rounded-b-3xl pointer-events-none">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="flex justify-between items-center z-10 relative mb-6">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center border-4 border-slate-800 shadow-xl text-2xl">
                <FaUser className="text-white" />
             </div>
             <div>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Kaşif Paneli</p>
               <h2 className="text-xl font-bold tracking-tight">{student.name}</h2>
             </div>
          </div>
          <button onClick={onLogout} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition border border-white/10"><FaSignOutAlt className="ml-0.5" /></button>
        </div>
        
        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/20 rounded-bl-full -mr-2 -mt-2 transition group-hover:bg-amber-500/30"></div>
            <span className="text-slate-400 text-xs font-bold uppercase mb-1">Genel Puan</span>
            <div className="flex items-center gap-2 text-amber-400">
              <FaCoins />
              <span className="font-black text-2xl text-white">{student.points}</span>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex flex-col items-center relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/20 rounded-bl-full -mr-2 -mt-2 transition group-hover:bg-emerald-500/30"></div>
            <span className="text-slate-400 text-xs font-bold uppercase mb-1">Namaz Puanı</span>
            <div className="flex items-center gap-2 text-emerald-400">
              <FaStar />
              <span className="font-black text-2xl text-white">{student.namazPoints}</span>
            </div>
          </div>
        </div>

        {student.badges.length > 0 && (
          <div className="mt-6 relative z-10">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full">
               {student.badges.map(badgeId => {
                 const badge = badges.find(b => b.id === badgeId);
                 if (!badge) return null;
                 return (
                   <button 
                     key={badgeId} 
                     onClick={() => setShowCelebration(badge)}
                     className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap min-w-fit hover:bg-slate-700 transition"
                   >
                     <span>{badge.icon}</span> {badge.title}
                   </button>
                 );
               })}
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-6">
        {activeTab === 'home' && (
          <div className="animate-fade-in-up space-y-8">
             
             {/* Namaz Vakitleri */}
             <div>
               <div className="flex justify-between items-center mb-4 px-1">
                 <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Vakitler</h3>
                 <span className="text-xs font-semibold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">{new Date().toLocaleDateString('tr-TR')}</span>
               </div>
               
               {loading ? (
                   <div className="flex justify-center py-6"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
                ) : (
                  <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                      {prayerTimes.map(p => {
                         const status = getStatus(p);
                         const isCurrent = status === 'current';
                         const dateKey = new Date().toISOString().split('T')[0];
                         const saved = student.prayers[`${dateKey}-${p.id}`];
                         const icon = getPrayerIcon(p.id);

                         return (
                            <div key={p.id} className={`flex-shrink-0 w-36 p-4 rounded-2xl border transition-all flex flex-col items-center justify-between gap-3 relative overflow-hidden ${isCurrent ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-200 scale-105' : 'bg-white border-slate-200 text-slate-600'}`}>
                               {saved && <div className="absolute top-2 right-2 text-emerald-500 bg-white rounded-full p-1 shadow-sm text-xs"><FaCheck /></div>}
                               
                               <div className="text-center">
                                 <div className={`text-2xl mb-1 ${isCurrent ? 'text-indigo-200' : 'text-slate-400'}`}>{icon}</div>
                                 <div className="font-bold text-sm">{p.label}</div>
                                 <div className={`text-xs opacity-80 ${isCurrent ? 'text-indigo-100' : 'text-slate-400'}`}>{p.time}</div>
                               </div>

                               {!saved ? (
                                  <div className="flex w-full gap-1 mt-1">
                                    <button onClick={() => togglePrayer(p.id, 'tek')} disabled={status === 'locked'} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase ${isCurrent ? 'bg-indigo-500 hover:bg-indigo-400' : 'bg-slate-100 hover:bg-slate-200'}`}>Tek</button>
                                    <button onClick={() => togglePrayer(p.id, 'cemaat')} disabled={status === 'locked'} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase ${isCurrent ? 'bg-white text-indigo-700 hover:bg-indigo-50' : 'bg-slate-100 hover:bg-slate-200'}`}>Cem.</button>
                                  </div>
                               ) : (
                                 <div className="w-full text-center py-1.5 rounded-lg bg-white/10 text-[10px] font-bold uppercase">{saved.type === 'cemaat' ? 'Cemaatle' : 'Tek Başına'}</div>
                               )}
                            </div>
                         );
                      })}
                  </div>
                )}
             </div>

            {/* EVENTS / ACTIVITIES SECTION (NEW) */}
            {events.length > 0 && (
                <div>
                   <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-4 px-1">Yaklaşan Etkinlikler</h3>
                   <div className="space-y-4">
                       {events.map(event => (
                           <div key={event.id} className="bg-gradient-to-br from-orange-400 to-rose-500 p-5 rounded-2xl text-white shadow-lg shadow-orange-200 relative overflow-hidden">
                               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                               <div className="relative z-10">
                                   <div className="flex justify-between items-start mb-2">
                                       <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase backdrop-blur-sm">{event.classCode === 'GLOBAL' ? 'Tüm Kaşifler' : 'Grubuna Özel'}</span>
                                       <FaCalendarDay className="text-white/50 text-xl" />
                                   </div>
                                   <h4 className="font-black text-xl mb-1">{event.title}</h4>
                                   <p className="text-xs text-orange-100 mb-3 line-clamp-2">{event.description}</p>
                                   <div className="flex gap-4 text-xs font-bold">
                                       <div className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded-lg">
                                           <FaClock /> {event.date} {event.time}
                                       </div>
                                       <div className="flex items-center gap-1 bg-black/10 px-2 py-1 rounded-lg">
                                           <FaMapPin /> {event.location}
                                       </div>
                                   </div>
                               </div>
                           </div>
                       ))}
                   </div>
                </div>
            )}

             {/* Haftalık Görevler */}
             {tasks.length > 0 && (
               <div>
                  <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide mb-4 px-1">Görevlerim</h3>
                  <div className="space-y-4">
                    {tasks.map(task => {
                      const isCompleted = student.completedTasks.includes(task.id);
                      const isPending = student.pendingTasks?.includes(task.id);
                      
                      return (
                        <div key={task.id} className={`relative overflow-hidden p-6 rounded-[2rem] border-2 transition-all group ${
                            isCompleted ? 'bg-slate-50 border-slate-200 opacity-75' : 
                            isPending ? 'bg-amber-50 border-amber-200' :
                            'bg-gradient-to-br from-white to-purple-50 border-purple-100 shadow-xl shadow-purple-100/50'
                        }`}>
                           {/* Decorative Circle */}
                           <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16 pointer-events-none"></div>

                           <div className="flex justify-between items-start relative z-10">
                              <div className="flex items-start gap-4">
                                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 transition duration-300 ${
                                      isCompleted ? 'bg-slate-200 text-slate-400' :
                                      isPending ? 'bg-amber-100 text-amber-500' :
                                      'bg-purple-500 text-white'
                                  }`}>
                                    {isPending ? <FaHourglassHalf /> : <FaTasks />}
                                  </div>
                                  <div>
                                    <h4 className={`font-black text-lg leading-tight mb-1 ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{task.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${isCompleted ? 'bg-slate-200 text-slate-500' : 'bg-purple-100 text-purple-600'}`}>
                                            +{task.reward} {task.currency}
                                        </span>
                                        {isPending && <span className="text-xs font-bold text-amber-500 flex items-center gap-1"><FaHourglassHalf /> Onay Bekliyor</span>}
                                    </div>
                                  </div>
                              </div>
                           </div>

                           <button 
                             onClick={() => completeTask(task)} 
                             disabled={isCompleted || isPending}
                             className={`w-full mt-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition transform active:scale-95 ${
                               isCompleted ? 'bg-slate-200 text-slate-400' :
                               isPending ? 'bg-amber-200 text-amber-600' :
                               'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/30'
                             }`}
                           >
                             {isCompleted ? <><FaCheck /> Tamamlandı</> : 
                              isPending ? <><FaHourglassHalf /> İnceleniyor</> : 
                              <><FaCheck /> Tamamladım</>}
                           </button>
                        </div>
                      )
                    })}
                  </div>
               </div>
             )}
          </div>
        )}
        
        {/* Rest of the tabs remain similar... */}
        {activeTab === 'academic' && (
           <div className="animate-fade-in-up space-y-6">
              {/* Active Assignment Section */}
              {student.readingAssignment && (
                <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                  <FaBookOpen className="absolute top-4 right-4 text-white/20 text-6xl" />
                  <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">Mevcut Ödevin</p>
                  <h3 className="text-xl font-black mb-2">{student.readingAssignment}</h3>
                  <p className="text-xs text-white/80">Eğitmenin tarafından atandı.</p>
                </div>
              )}

              {/* Attendance Summary */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                 <h3 className="font-bold text-slate-700 text-sm uppercase mb-4 tracking-wide flex items-center gap-2"><FaCalendarAlt className="text-indigo-500" /> Yoklama Durumu</h3>
                 <div className="flex flex-wrap gap-2">
                    {Object.entries(student.attendance).slice(-10).reverse().map(([date, status]) => (
                       <div key={date} className={`px-3 py-2 rounded-lg text-xs font-bold border ${status === 'present' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{date.split('-').slice(1).reverse().join('.')}</div>
                    ))}
                    {Object.keys(student.attendance).length === 0 && <span className="text-xs text-gray-400">Henüz kayıt yok.</span>}
                 </div>
              </div>

              {/* Reading History */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-700 text-sm uppercase mb-4 tracking-wide flex items-center gap-2"><FaBookOpen className="text-blue-500" /> Yüzüne Okuma Geçmişi</h3>
                  <div className="space-y-2">
                    {Object.entries(student.reading).sort().reverse().map(([date, status]) => (
                      <div key={date} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-gray-500">{date}</span>
                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${status === 'passed' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {status === 'passed' ? 'Geçti' : 'Kaldı'}
                        </span>
                      </div>
                    ))}
                    {Object.keys(student.reading).length === 0 && <span className="text-xs text-gray-400">Henüz kayıt yok.</span>}
                  </div>
              </div>

               {/* Memorization Status (Read Only) */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-700 text-sm uppercase mb-4 tracking-wide flex items-center gap-2"><FaMicrophone className="text-purple-500" /> Ezber Karnesi</h3>
                  <div className="grid grid-cols-2 gap-2">
                     {SURAH_LIST.map(s => {
                       const status = student.memorization[s.id];
                       if(!status || status === 'none') return null;
                       return (
                         <div key={s.id} className={`p-3 rounded-xl border flex items-center justify-between ${status === 'passed' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <span className="text-xs font-bold text-slate-700">{s.title}</span>
                            {status === 'passed' ? <FaCheck className="text-emerald-500 text-xs" /> : <FaMicrophone className="text-amber-500 text-xs" />}
                         </div>
                       )
                     })}
                     {Object.keys(student.memorization).length === 0 && <span className="text-xs text-gray-400">Henüz kayıt yok.</span>}
                  </div>
               </div>
           </div>
        )}

        {activeTab === 'ezber' && (
           <div className="animate-fade-in-up space-y-3">
              <div className="flex items-center justify-between px-1 mb-2">
                 <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Sure Listesi</h3>
                 <span className="text-xs text-slate-400 font-medium">Mishary Rashid Alafasy</span>
              </div>
              {SURAH_LIST.map((s, idx) => {
                 const isPlaying = playingSurahId === s.id;
                 return (
                   <div key={s.id} className={`bg-white p-4 rounded-xl border transition-all flex justify-between items-center group hover:border-indigo-200 ${isPlaying ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-4">
                         <span className="text-xs font-bold text-slate-300 w-6 text-center">{s.number}</span>
                         <div className="relative">
                            <button 
                              onClick={() => toggleSurahAudio(s)}
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}
                            >
                                {isPlaying ? <FaPause className="text-sm" /> : <FaPlay className="pl-0.5 text-sm" />}
                            </button>
                         </div>
                         <div>
                            <span className={`font-bold text-sm block ${isPlaying ? 'text-indigo-700' : 'text-slate-700'}`}>{s.title}</span>
                         </div>
                      </div>
                      {student.memorization[s.id] === 'passed' && (
                        <div className="text-emerald-500 text-lg">
                          <FaCheck />
                        </div>
                      )}
                   </div>
                 );
              })}
           </div>
        )}

        {activeTab === 'games' && (
           <div className="animate-fade-in-up h-full">
              {activeGame === 'quiz' ? (
                <QuizGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />
              ) : activeGame === 'duel' ? (
                <DuelGame onClose={() => setActiveGame(null)} onComplete={handleGameComplete} />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                   {/* QUIZ CARD */}
                   <div 
                     onClick={() => setActiveGame('quiz')}
                     className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-all group"
                   >
                      <div className="flex items-center gap-5">
                         <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <FaTrophy />
                         </div>
                         <div>
                            <h3 className="font-bold text-slate-800 text-lg">Bilgi Yarışması</h3>
                            <p className="text-xs text-slate-400 font-medium mt-1">Dini bilgilerini test et ve GP kazan.</p>
                         </div>
                      </div>
                      <FaPlay className="text-slate-300 group-hover:text-indigo-500" />
                   </div>
                   
                   {/* DUEL CARD */}
                   <div 
                     onClick={() => setActiveGame('duel')}
                     className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700 shadow-xl flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-all group relative overflow-hidden"
                   >
                      {/* Effects */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                      
                      <div className="flex items-center gap-5 relative z-10">
                         <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-2xl text-white border border-white/20">
                            <FaBolt className="text-yellow-400" />
                         </div>
                         <div>
                            <h3 className="font-bold text-white text-lg">İlmi Düello</h3>
                            <p className="text-xs text-slate-300 font-medium mt-1">Sanal Hafız'a karşı yarış! <span className="text-yellow-400 font-bold">+GP</span></p>
                         </div>
                      </div>
                      <div className="bg-white/10 p-2 rounded-full relative z-10">
                        <FaRobot className="text-white" />
                      </div>
                   </div>
                </div>
              )}
           </div>
        )}

        {activeTab === 'market' && (
           <div className="animate-fade-in-up grid grid-cols-2 gap-4">
              {marketItems.map(item => {
                 const isPending = student.pendingItems?.some(p => p.itemId === item.id);
                 return (
                 <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-between h-full hover:shadow-md transition relative overflow-hidden">
                    {item.stock <= 0 && <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center font-bold text-red-500 rotate-12 border-2 border-red-500 rounded-2xl m-2">Tükendi</div>}
                    
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-2xl mb-3">{item.icon}</div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1 leading-tight">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mb-3 px-2 line-clamp-2">{item.description}</p>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mb-2">Stok: {item.stock}</span>
                    </div>
                    <div className="w-full space-y-2">
                       <span className="block text-center text-xs font-bold text-indigo-600 bg-indigo-50 py-1 rounded-md">{item.price} {item.currency}</span>
                       <button 
                         onClick={() => handleBuyItem(item)}
                         disabled={item.stock <= 0 || isPending}
                         className={`w-full py-2 rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2 ${
                           isPending ? 'bg-yellow-500 text-white cursor-wait' : 
                           item.stock <= 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' :
                           'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                         }`}
                       >
                         {isPending ? <FaHourglassHalf /> : <FaShoppingCart />} {isPending ? 'Onay Bekliyor' : 'Al'}
                       </button>
                    </div>
                 </div>
              )})}
           </div>
        )}
      </div>

      {/* Modern Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 pb-6 px-6 flex justify-around items-center z-50">
        <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<FaUser />} label="Profil" />
        <NavButton active={activeTab === 'academic'} onClick={() => setActiveTab('academic')} icon={<FaBookOpen />} label="Ders" />
        <NavButton active={activeTab === 'ezber'} onClick={() => setActiveTab('ezber')} icon={<FaMicrophone />} label="Ezber" />
        <NavButton active={activeTab === 'games'} onClick={() => setActiveTab('games')} icon={<FaGamepad />} label="Oyun" />
        <NavButton active={activeTab === 'market'} onClick={() => setActiveTab('market')} icon={<FaShoppingBasket />} label="Market" />
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all w-16 ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
      <span className={`text-xl mb-1 transition-transform ${active ? 'scale-110' : ''}`}>{icon}</span>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}
