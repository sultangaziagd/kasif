
import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserTie, FaDownload, FaSignOutAlt, FaTrash, FaKey, FaSave, FaSearch, FaTimes, FaUserPlus, FaEdit, FaLock, FaCopy, FaCheck, FaExclamationCircle, FaCalendarPlus, FaClock, FaMapPin, FaGlobe, FaFileAlt } from 'react-icons/fa';
import { Instructor, Student, AppEvent, WeeklyReport } from '../types';

interface AdminDashboardProps {
  instructors: Instructor[];
  students: Student[];
  events: AppEvent[];
  reports: WeeklyReport[];
  updateInstructor: (id: number, updater: (i: Instructor) => Instructor) => void;
  setInstructors: React.Dispatch<React.SetStateAction<Instructor[]>>;
  setEvents: (events: AppEvent[]) => void;
  onLogout: () => void;
}

export default function AdminDashboard({ instructors, students, updateInstructor, setInstructors, onLogout, events, setEvents, reports }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'events' | 'reports'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Edit States
  const [tempPassword, setTempPassword] = useState('');
  const [tempUsername, setTempUsername] = useState('');

  // Password Reset Modal State
  const [resetPasswordId, setResetPasswordId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Add Instructor State
  const [newInstructor, setNewInstructor] = useState({ name: '', username: '', password: '' });
  
  // Global Event State
  const [newGlobalEvent, setNewGlobalEvent] = useState({ title: '', description: '', date: '', time: '', location: '' });

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

  // Reset temp states when editing ID changes
  useEffect(() => {
    if (editingId === null) {
      setTempPassword('');
      setTempUsername('');
    }
  }, [editingId]);

  // Helper function to export data to CSV (Excel compatible)
  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const BOM = "\uFEFF";
    const csvContent =
      BOM +
      [
        headers.join(','),
        ...data.map(row => 
          Object.values(row).map(val => 
            typeof val === 'object' ? `"${JSON.stringify(val).replace(/"/g, '""')}"` : `"${val}"`
          ).join(',')
        )
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportStudents = () => {
    const formattedStudents = students.map(s => ({
      ID: s.id,
      Ad_Soyad: s.name,
      Kullanici_Adi: s.username,
      Grup_Kodu: s.classCode,
      Puan_GP: s.points,
      Namaz_Puan_NP: s.namazPoints,
      Durum: s.status,
      Veli_Tel: s.parentPhone || '',
      Kaşif_Tel: s.studentPhone || ''
    }));
    exportToCSV(formattedStudents, 'kasif_listesi.csv', ['ID', 'Ad Soyad', 'Kullanıcı Adı', 'Grup Kodu', 'GP', 'NP', 'Durum', 'Veli Tel', 'Kaşif Tel']);
  };

  const handleExportInstructors = () => {
    const formattedInstructors = instructors.map(i => ({
      ID: i.id,
      Ad_Soyad: i.name,
      Kullanici_Adi: i.username,
      Sifre: i.password,
      Sinif_Kodlari: i.classCodes.join(' - ')
    }));
    exportToCSV(formattedInstructors, 'kasif_abileri_listesi.csv', ['ID', 'Ad Soyad', 'Kullanıcı Adı', 'Şifre', 'Sınıf Kodları']);
  };

  const handleAddInstructor = () => {
    if (!newInstructor.name || !newInstructor.username || !newInstructor.password) {
      showNotification('error', "Lütfen tüm alanları doldurun.");
      return;
    }
    if (instructors.some(i => i.username === newInstructor.username)) {
      showNotification('error', "Bu kullanıcı adı zaten kullanılıyor.");
      return;
    }

    const newInst: Instructor = {
      id: Date.now(),
      name: newInstructor.name,
      username: newInstructor.username,
      password: newInstructor.password,
      classCodes: []
    };

    setInstructors(prev => [...prev, newInst]);
    setNewInstructor({ name: '', username: '', password: '' });
    showNotification('success', "Yeni Kaşif Abisi başarıyla eklendi.");
  };

  const startEditing = (inst: Instructor) => {
    setEditingId(inst.id);
    setTempPassword(inst.password);
    setTempUsername(inst.username);
  };

  const saveEditing = (id: number) => {
    if (!tempUsername || !tempPassword) {
        showNotification('error', "Kullanıcı adı ve şifre boş olamaz.");
        return;
    }

    const currentInst = instructors.find(i => i.id === id);
    if (currentInst?.username !== tempUsername) {
       if (instructors.some(i => i.username === tempUsername && i.id !== id)) {
         showNotification('error', "Bu kullanıcı adı başka bir abi tarafından kullanılıyor.");
         return;
       }
    }

    updateInstructor(id, i => ({ ...i, password: tempPassword, username: tempUsername }));
    setEditingId(null);
    showNotification('success', 'Bilgiler güncellendi!');
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const deleteInstructor = (id: number) => {
    if (window.confirm('Bu Kaşif Abisini silmek istediğinize emin misiniz?')) {
      setInstructors(prev => {
          const newState = prev.filter(i => i.id !== id);
          return newState;
      });
      showNotification('success', 'Kayıt başarıyla silindi.');
    }
  };
  
  const handleDeleteClassCode = (instructorId: number, codeToDelete: string) => {
    if (window.confirm(`${codeToDelete} kodlu grubu ve bağlı tüm öğrencileri/verileri silmek istediğinize emin misiniz?`)) {
        updateInstructor(instructorId, (inst) => ({
            ...inst,
            classCodes: inst.classCodes.filter(c => c !== codeToDelete)
        }));
        showNotification('success', 'Grup kodu silindi.');
    }
  };

  const openPasswordReset = (id: number) => {
    setResetPasswordId(id);
    setNewPassword('');
  };

  const saveNewPassword = () => {
    if (resetPasswordId === null) return;
    if (!newPassword) {
      showNotification('error', 'Şifre boş olamaz!');
      return;
    }
    updateInstructor(resetPasswordId, i => ({ ...i, password: newPassword }));
    setResetPasswordId(null);
    setNewPassword('');
    showNotification('success', 'Şifre başarıyla güncellendi.');
  };

  const addGlobalEvent = () => {
    if (!newGlobalEvent.title || !newGlobalEvent.date || !newGlobalEvent.time) {
        showNotification('error', 'Lütfen başlık, tarih ve saat alanlarını doldurun.');
        return;
    }
    const evt: AppEvent = {
        id: Date.now(),
        title: newGlobalEvent.title,
        description: newGlobalEvent.description,
        date: newGlobalEvent.date,
        time: newGlobalEvent.time,
        location: newGlobalEvent.location,
        classCode: 'GLOBAL',
        createdBy: 'admin'
    };
    setEvents([...events, evt]);
    setNewGlobalEvent({ title: '', description: '', date: '', time: '', location: '' });
    showNotification('success', 'Genel etkinlik yayınlandı.');
  };

  const deleteGlobalEvent = (id: number) => {
      if(window.confirm("Bu etkinliği silmek istediğine emin misin?")) {
          setEvents(events.filter(e => e.id !== id));
          showNotification('success', 'Etkinlik silindi.');
      }
  };

  const filteredInstructors = instructors.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-10">
      
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

      {/* Header */}
      <div className="bg-slate-900 text-white p-6 pt-8 pb-12 shadow-2xl rounded-b-[3rem] relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
         <div className="relative z-10 flex justify-between items-center max-w-5xl mx-auto">
            <div>
              <p className="text-rose-400 text-xs font-bold uppercase tracking-widest">Sistem Yönetimi</p>
              <h1 className="text-3xl font-black">Yönetici Paneli</h1>
            </div>
            <button onClick={onLogout} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition flex items-center gap-2">
               <FaSignOutAlt /> <span className="text-sm font-bold">Çıkış</span>
            </button>
         </div>
      </div>

      <div className="max-w-5xl mx-auto -mt-8 px-4 space-y-8 relative z-20">
        
        {/* Navigation Tabs */}
        <div className="flex justify-center">
            <div className="bg-white p-2 rounded-2xl shadow-lg flex gap-2">
                <button onClick={() => setActiveTab('users')} className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === 'users' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Kullanıcılar</button>
                <button onClick={() => setActiveTab('events')} className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === 'events' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Etkinlikler</button>
                <button onClick={() => setActiveTab('reports')} className={`px-6 py-2 rounded-xl font-bold transition ${activeTab === 'reports' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>Raporlar</button>
            </div>
        </div>
        
        {activeTab === 'users' && (
          <div className="animate-fade-in space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Toplam Kaşif</p>
                    <h2 className="text-4xl font-black text-slate-800">{students.length}</h2>
                  </div>
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl">
                    <FaUsers />
                  </div>
               </div>
               <div className="bg-white p-6 rounded-3xl shadow-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase">Toplam Kaşif Abisi</p>
                    <h2 className="text-4xl font-black text-slate-800">{instructors.length}</h2>
                  </div>
                  <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-3xl">
                    <FaUserTie />
                  </div>
               </div>
            </div>

            {/* Add Instructor & Export Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Add Instructor Form */}
               <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-lg border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><FaUserPlus className="text-emerald-500" /> Yeni Kaşif Abisi Ekle</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                     <input 
                       type="text" 
                       placeholder="Ad Soyad" 
                       value={newInstructor.name}
                       onChange={e => setNewInstructor({...newInstructor, name: e.target.value})}
                       className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500 text-sm"
                     />
                     <input 
                       type="text" 
                       placeholder="Kullanıcı Adı" 
                       value={newInstructor.username}
                       onChange={e => setNewInstructor({...newInstructor, username: e.target.value})}
                       className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500 text-sm"
                     />
                     <input 
                       type="text" 
                       placeholder="Şifre" 
                       value={newInstructor.password}
                       onChange={e => setNewInstructor({...newInstructor, password: e.target.value})}
                       className="bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:border-emerald-500 text-sm"
                     />
                  </div>
                  <button 
                    onClick={handleAddInstructor}
                    className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 transition"
                  >
                    Kaşif Abisini Kaydet
                  </button>
               </div>

               {/* Export Actions */}
               <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-3xl shadow-lg flex flex-col justify-center gap-4">
                  <div>
                     <h3 className="font-bold text-lg">Dışa Aktar</h3>
                     <p className="text-slate-400 text-xs">Verileri Excel (CSV) olarak indir.</p>
                  </div>
                  <button onClick={handleExportStudents} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition border border-white/5 text-sm">
                    <FaDownload /> Kaşif Listesi
                  </button>
                  <button onClick={handleExportInstructors} className="bg-white/10 hover:bg-white/20 p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition border border-white/5 text-sm">
                    <FaDownload /> Abiler Listesi
                  </button>
               </div>
            </div>

            {/* Instructor Management Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                     <FaUserTie className="text-rose-500" /> Kaşif Abileri Listesi
                  </h3>
                  <div className="relative w-full md:w-auto">
                     <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <input 
                       type="text" 
                       placeholder="Abisi ara..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500 w-full md:w-64"
                     />
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                        <tr>
                           <th className="p-4">Ad Soyad</th>
                           <th className="p-4">Kullanıcı Adı</th>
                           <th className="p-4">Şifre</th>
                           <th className="p-4">Sınıf Kodları</th>
                           <th className="p-4 text-right">İşlemler</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {filteredInstructors.map(inst => (
                           <tr key={inst.id} className="hover:bg-slate-50 transition">
                              <td className="p-4 font-bold text-slate-700">{inst.name}</td>
                              
                              {/* Username & Password Editing Logic */}
                              {editingId === inst.id ? (
                                 <>
                                    <td className="p-4">
                                       <input 
                                         type="text" 
                                         value={tempUsername} 
                                         onChange={(e) => setTempUsername(e.target.value)}
                                         className="w-full p-2 border border-blue-200 rounded-lg outline-none focus:border-blue-500 text-sm bg-white"
                                         placeholder="Kullanıcı Adı"
                                       />
                                    </td>
                                    <td className="p-4">
                                       <input 
                                         type="text" 
                                         value={tempPassword} 
                                         onChange={(e) => setTempPassword(e.target.value)}
                                         className="w-full p-2 border border-blue-200 rounded-lg outline-none focus:border-blue-500 text-sm bg-white"
                                         placeholder="Yeni Şifre"
                                       />
                                    </td>
                                 </>
                              ) : (
                                 <>
                                    <td className="p-4 text-slate-600">{inst.username}</td>
                                    <td className="p-4 text-slate-400 font-mono tracking-widest">••••••</td>
                                 </>
                              )}

                              <td className="p-4">
                                 <div className="flex gap-2 flex-wrap">
                                    {inst.classCodes.map(code => (
                                       <div key={code} className="bg-blue-50 text-blue-600 pl-3 pr-1 py-1 rounded-lg text-xs font-bold flex items-center gap-2 border border-blue-100 group">
                                          <span>{code}</span>
                                          <div className="flex items-center border-l border-blue-200 pl-2 ml-1 gap-1">
                                             <button 
                                                onClick={() => {
                                                    navigator.clipboard.writeText(code);
                                                    showNotification('success', 'Kod kopyalandı');
                                                }} 
                                                className="p-1 hover:bg-blue-200 rounded text-blue-400 hover:text-blue-700 transition" 
                                                title="Kopyala"
                                             >
                                                <FaCopy size={10} />
                                             </button>
                                             <button 
                                                onClick={() => handleDeleteClassCode(inst.id, code)} 
                                                className="p-1 hover:bg-red-200 rounded text-red-400 hover:text-red-600 transition" 
                                                title="Sil"
                                             >
                                                <FaTrash size={10} />
                                             </button>
                                          </div>
                                       </div>
                                    ))}
                                    {inst.classCodes.length === 0 && <span className="text-slate-400 text-xs italic">Kod yok</span>}
                                 </div>
                              </td>
                              
                              <td className="p-4 text-right">
                                 {editingId === inst.id ? (
                                    <div className="flex items-center justify-end gap-2">
                                       <button onClick={() => saveEditing(inst.id)} className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600" title="Kaydet"><FaSave /></button>
                                       <button onClick={cancelEditing} className="bg-gray-200 text-gray-500 p-2 rounded-lg hover:bg-gray-300" title="İptal"><FaTimes /></button>
                                    </div>
                                 ) : (
                                    <div className="flex items-center justify-end gap-2">
                                       <button onClick={() => openPasswordReset(inst.id)} className="bg-amber-100 text-amber-600 p-2 rounded-xl hover:bg-amber-500 hover:text-white transition" title="Şifre Sıfırla">
                                          <FaKey />
                                       </button>
                                       <button onClick={() => startEditing(inst)} className="bg-blue-50 text-blue-600 p-2 rounded-xl hover:bg-blue-100 transition" title="Düzenle">
                                          <FaEdit />
                                       </button>
                                       <button onClick={() => deleteInstructor(inst.id)} className="bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-100 transition" title="Sil">
                                          <FaTrash />
                                       </button>
                                    </div>
                                 )}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  {filteredInstructors.length === 0 && (
                     <div className="p-8 text-center text-slate-400">Aradığınız kriterde Kaşif Abisi bulunamadı.</div>
                  )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
           <div className="animate-fade-in space-y-8">
               {/* Global Event Form */}
               <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
                    <h3 className="font-black text-orange-500 text-xs uppercase mb-6 tracking-widest flex items-center gap-2"><FaGlobe /> Genel Etkinlik Oluştur (Tüm Gruplar)</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Etkinlik Adı" value={newGlobalEvent.title} onChange={e => setNewGlobalEvent({...newGlobalEvent, title: e.target.value})} className="col-span-2 bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" />
                            <div className="relative">
                                    <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                                    <input type="date" value={newGlobalEvent.date} onChange={e => setNewGlobalEvent({...newGlobalEvent, date: e.target.value})} className="w-full bg-gray-50 p-4 pl-10 rounded-2xl outline-none text-xs font-bold" />
                            </div>
                            <div className="relative">
                                    <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                                    <input type="time" value={newGlobalEvent.time} onChange={e => setNewGlobalEvent({...newGlobalEvent, time: e.target.value})} className="w-full bg-gray-50 p-4 pl-10 rounded-2xl outline-none text-xs font-bold" />
                            </div>
                        </div>
                        <div className="relative">
                            <FaMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input type="text" placeholder="Konum" value={newGlobalEvent.location} onChange={e => setNewGlobalEvent({...newGlobalEvent, location: e.target.value})} className="w-full bg-gray-50 p-4 pl-10 rounded-2xl outline-none text-sm" />
                        </div>
                        <textarea placeholder="Etkinlik detayları..." value={newGlobalEvent.description} onChange={e => setNewGlobalEvent({...newGlobalEvent, description: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none text-sm h-20" />
                        
                        <button onClick={addGlobalEvent} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-200">Genel Etkinliği Yayınla</button>
                    </div>

                    {/* List Global Events */}
                    <div className="mt-6 space-y-2">
                        {events.filter(e => e.classCode === 'GLOBAL').map(evt => (
                            <div key={evt.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <div>
                                        <h4 className="font-bold text-orange-900 text-sm">{evt.title}</h4>
                                        <p className="text-xs text-orange-700 flex items-center gap-2 mt-1">
                                            <span>{evt.date} {evt.time}</span> • <span>{evt.location}</span>
                                        </p>
                                        <span className="text-[10px] bg-white px-2 py-0.5 rounded text-orange-400 font-bold mt-1 inline-block">TÜM GRUPLAR</span>
                                    </div>
                                    <button onClick={() => deleteGlobalEvent(evt.id)} className="text-orange-400 hover:text-red-500"><FaTrash /></button>
                            </div>
                        ))}
                        {events.filter(e => e.classCode === 'GLOBAL').length === 0 && <p className="text-center text-gray-400 text-sm py-4">Henüz genel etkinlik yok.</p>}
                    </div>
                </section>
           </div>
        )}

        {activeTab === 'reports' && (
           <div className="animate-fade-in">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                       <FaFileAlt className="text-indigo-500" /> Haftalık Kaşif Raporları
                    </h3>
                 </div>
                 
                 <div className="p-6">
                    {reports.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">Henüz gönderilmiş bir rapor yok.</div>
                    ) : (
                        <div className="space-y-4">
                            {reports.sort((a,b) => b.id - a.id).map(report => (
                                <div key={report.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-slate-800">{report.instructorName}</h4>
                                            <span className="text-xs text-slate-500">Rapor Tarihi: {report.reportDate}</span>
                                        </div>
                                        {report.isHeld ? (
                                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold">Yapıldı</span>
                                        ) : (
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-lg text-xs font-bold">Yapılmadı</span>
                                        )}
                                    </div>
                                    
                                    {report.isHeld && (
                                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                            <div className="bg-slate-50 p-2 rounded-xl">
                                                <span className="block text-[10px] text-slate-400 font-bold uppercase">Katılımcı</span>
                                                <span className="font-bold text-slate-700">{report.attendeeCount} Kişi</span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-xl">
                                                <span className="block text-[10px] text-slate-400 font-bold uppercase">Mekan</span>
                                                <span className="font-bold text-slate-700">{report.location}</span>
                                            </div>
                                        </div>
                                    )}

                                    {report.notes && (
                                        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl italic">
                                            "{report.notes}"
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                 </div>
              </div>
           </div>
        )}

      </div>

      {/* PASSWORD RESET MODAL */}
      {resetPasswordId !== null && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up">
               <div className="bg-amber-500 p-6 text-white text-center">
                  <FaKey className="text-4xl mx-auto mb-2 opacity-80" />
                  <h3 className="font-black text-xl">Şifre Sıfırla</h3>
                  <p className="text-white/80 text-xs">Yeni şifreyi belirleyin.</p>
               </div>
               <div className="p-6 space-y-4">
                  <input 
                    type="text" 
                    placeholder="Yeni Şifre" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 p-4 rounded-xl border border-slate-200 outline-none text-center font-mono tracking-widest text-lg focus:border-amber-500 transition"
                  />
                  <div className="flex gap-3">
                     <button onClick={() => setResetPasswordId(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition">İptal</button>
                     <button onClick={saveNewPassword} className="flex-1 py-3 rounded-xl font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-200 transition">Kaydet</button>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
