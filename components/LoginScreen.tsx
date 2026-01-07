
import React, { useState, useEffect } from 'react';
import { FaUserTie, FaUserGraduate, FaLock, FaUser, FaKey, FaArrowLeft, FaCheckCircle, FaUserPlus, FaCheck, FaExclamationCircle, FaCompass, FaPhone, FaMapMarkerAlt, FaSchool, FaBinoculars } from 'react-icons/fa';
import { Student, Instructor } from '../types';

interface LoginScreenProps {
  onLogin: (role: 'instructor' | 'student' | 'admin', user: Student | Instructor | any) => void;
  onRegisterStudent: (data: any) => void;
  onRegisterInstructor: (data: any) => void;
  students: Student[];
  instructors: Instructor[];
}

export default function LoginScreen({ onLogin, onRegisterStudent, onRegisterInstructor, students, instructors }: LoginScreenProps) {
  const [view, setView] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [role, setRole] = useState<'instructor' | 'student' | 'admin'>('student');
  
  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [classCode, setClassCode] = useState('');
  
  // New Student Fields
  const [parentPhone, setParentPhone] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [address, setAddress] = useState('');
  const [school, setSchool] = useState('');

  const [error, setError] = useState('');

  // Notification State
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Admin Check Logic (Updated Credentials)
    if (username === 'agdsultangazi' && password === 'agdsultangazi1453') {
        onLogin('admin', { name: 'Süper Admin' });
        return;
    }

    if (role === 'instructor') {
      const instructor = instructors.find(i => i.username === username && i.password === password);
      if (instructor) {
        onLogin('instructor', instructor);
      } else {
        setError('Hatalı Kaşif Abisi kullanıcı adı veya şifresi!');
      }
    } else {
      const student = students.find(s => s.username === username && s.password === password);
      if (student) {
        if (student.status === 'pending') {
          setError('Hesabınız henüz onaylanmadı. Lütfen Kaşif Abinizden onay isteyin.');
        } else {
          onLogin('student', student);
        }
      } else {
        setError('Hatalı kullanıcı adı veya şifre!');
      }
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'student') {
      if (!username || !password || !fullName || !classCode || !parentPhone) {
        setError('Lütfen zorunlu alanları (İsim, K.Adı, Şifre, Grup Kodu, Veli Tel) doldurun.');
        return;
      }
      
      const codeExists = instructors.some(i => i.classCodes.includes(classCode));
      if (!codeExists) {
        setError('Girdiğiniz grup kodu geçersiz veya sistemde kayıtlı değil.');
        return;
      }

      if (students.find(s => s.username === username)) {
        setError('Bu kullanıcı adı zaten alınmış.');
        return;
      }
      onRegisterStudent({ fullName, username, password, classCode, parentPhone, studentPhone, address, school });
      showNotification('success', 'Kayıt Başarılı! Hesabınız Kaşif Abisi onayından sonra açılacaktır.');
      
      // Delay switching view slightly to let user see the success message
      setTimeout(() => setView('login'), 2000);

    } else {
      if (!username || !password || !fullName) {
        setError('Lütfen tüm alanları doldurun.');
        return;
      }
      if (instructors.find(i => i.username === username)) {
        setError('Bu kullanıcı adı zaten alınmış.');
        return;
      }
      onRegisterInstructor({ fullName, username, password });
      showNotification('success', 'Kaşif Abisi kaydı başarılı!');
      setTimeout(() => setView('login'), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-900 text-white p-6 relative overflow-hidden">
      
      {/* NOTIFICATION POPUP */}
      {notification.show && (
         <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[150] w-full max-w-sm px-6 pointer-events-none">
            <div className={`bg-white p-4 rounded-2xl shadow-2xl border-l-8 animate-fade-in-down flex items-center gap-4 pointer-events-auto ${notification.type === 'success' ? 'border-emerald-500' : 'border-red-500'}`}>
               <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${notification.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {notification.type === 'success' ? <FaCheck /> : <FaExclamationCircle />}
               </div>
               <div>
                  <h4 className={`font-black text-sm ${notification.type === 'success' ? 'text-emerald-800' : 'text-red-800'}`}>
                    {notification.type === 'success' ? 'İşlem Başarılı' : 'Hata'}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-tight mt-0.5">
                    {notification.message}
                  </p>
               </div>
            </div>
         </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-[-50px] right-[-50px] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>

      {/* LOGO AND TITLE SECTION */}
      <div className="z-10 text-center mb-8 animate-fade-in-down">
        
        {/* Simple White Icon Logo (Unbreakable) */}
        <div className="flex justify-center mb-6">
            <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/20 shadow-2xl hover:scale-105 transition-transform duration-500">
                <FaCompass className="text-6xl text-white drop-shadow-md" />
            </div>
        </div>

        <h1 className="text-4xl font-black mb-2 tracking-tight text-white drop-shadow-lg">Kaşif Cepte</h1>
        <p className="text-blue-200 text-lg font-bold opacity-90 tracking-wide bg-white/10 px-4 py-1 rounded-full inline-block backdrop-blur-sm border border-white/10">
          Kaşifler Platformu
        </p>
      </div>

      <div className="w-full max-w-sm z-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden transition-all duration-500">
        
        {view === 'welcome' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-8">Hoş Geldiniz</h2>
            <button 
              onClick={() => { setRole('student'); setView('login'); }}
              className="w-full bg-white text-blue-900 py-5 rounded-2xl font-black shadow-xl hover:scale-[1.03] transition-all flex items-center justify-center gap-3 text-lg"
            >
              <FaBinoculars /> Kaşif Girişi
            </button>
            
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-transparent px-2 text-white/40 font-bold">Veya</span></div>
            </div>

            <button 
              onClick={() => { setRole('instructor'); setView('login'); }}
              className="w-full bg-blue-500/40 border border-white/20 text-white py-5 rounded-2xl font-black hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-lg"
            >
              <FaUserTie /> Kaşif Abisi Girişi
            </button>

            <div className="pt-4 text-center border-t border-white/10">
               <button 
                onClick={() => { setRole('student'); setView('register'); }}
                className="text-white text-sm font-black flex items-center justify-center gap-2 mx-auto hover:text-blue-300 transition"
               >
                 <FaUserPlus /> Yeni Kaşif Kaydı
               </button>
            </div>
          </div>
        )}

        {(view === 'login' || view === 'register') && (
          <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-5 animate-fade-in">
             <div className="flex items-center gap-3 mb-6">
                <button type="button" onClick={() => setView('welcome')} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition"><FaArrowLeft /></button>
                <div>
                   <h2 className="text-xl font-black">{role === 'student' ? 'Kaşif' : 'Kaşif Abisi'}</h2>
                   <p className="text-xs text-blue-200 opacity-60">{view === 'login' ? 'Giriş Paneli' : 'Kayıt Formu'}</p>
                </div>
             </div>

             {error && <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-2xl text-xs text-center font-bold animate-shake">{error}</div>}

             {view === 'register' && (
                  <>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-blue-300 ml-1">Tam Ad Soyad</label>
                    <div className="relative">
                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-400 transition" placeholder="Ahmet Yılmaz" />
                    </div>
                  </div>
                  {role === 'student' && (
                    <>
                       <div className="grid grid-cols-2 gap-2">
                           <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black text-blue-300 ml-1">Veli Tel</label>
                                <div className="relative">
                                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs" />
                                    <input type="tel" value={parentPhone} onChange={e => setParentPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-9 pr-2 outline-none focus:border-blue-400 transition text-sm" placeholder="05XX..." />
                                </div>
                           </div>
                           <div className="space-y-1">
                                <label className="text-[10px] uppercase font-black text-blue-300 ml-1">Kaşif Tel</label>
                                <div className="relative">
                                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-xs" />
                                    <input type="tel" value={studentPhone} onChange={e => setStudentPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-9 pr-2 outline-none focus:border-blue-400 transition text-sm" placeholder="Opsiyonel" />
                                </div>
                           </div>
                       </div>
                       <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-blue-300 ml-1">Okul Bilgisi</label>
                            <div className="relative">
                                <FaSchool className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                <input type="text" value={school} onChange={e => setSchool(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-400 transition" placeholder="Okul Adı / Sınıfı" />
                            </div>
                       </div>
                       <div className="space-y-1">
                            <label className="text-[10px] uppercase font-black text-blue-300 ml-1">Ev Adresi</label>
                            <div className="relative">
                                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-400 transition" placeholder="Mahalle / Sokak" />
                            </div>
                       </div>
                    </>
                  )}
                  </>
             )}

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-black text-blue-300 ml-1">Kullanıcı Adı</label>
              <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-400 transition" placeholder="kullanici_adi" />
              </div>
            </div>

             <div className="space-y-1">
               <label className="text-[10px] uppercase font-black text-blue-300 ml-1">
                 Şifre
               </label>
               <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-400 transition" placeholder="••••••••" />
               </div>
             </div>

             {view === 'register' && role === 'student' && (
               <div className="space-y-1">
                 <label className="text-[10px] uppercase font-black text-blue-400 ml-1 flex justify-between">Grup Kodu <span className="opacity-50">(Abiden Alın)</span></label>
                 <div className="relative">
                    <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="text" value={classCode} onChange={e => setClassCode(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-blue-400 transition font-mono tracking-widest" placeholder="123456" />
                 </div>
               </div>
             )}

             <button type="submit" className="w-full bg-blue-500 hover:bg-blue-400 text-white py-4 rounded-2xl font-black shadow-lg shadow-blue-500/20 transition transform active:scale-95 mt-4 flex items-center justify-center gap-2">
               {view === 'login' ? 'Giriş Yap' : 'Kayıt Ol'} <FaCheckCircle />
             </button>

             {role === 'student' && (
                <div className="text-center mt-6">
                    {view === 'login' ? (
                    <p className="text-xs text-blue-200/60">Hesabınız yok mu? <button type="button" onClick={() => setView('register')} className="font-black underline text-white">Kayıt Olun</button></p>
                    ) : (
                    <p className="text-xs text-blue-200/60">Zaten üye misiniz? <button type="button" onClick={() => setView('login')} className="font-black underline text-white">Giriş Yapın</button></p>
                    )}
                </div>
             )}
          </form>
        )}
      </div>

      <div className="mt-12 text-white/40 text-sm font-bold italic tracking-wider animate-pulse font-serif">
         "Hem eğleniyor hem keşfediyoruz"
      </div>
    </div>
  );
}
