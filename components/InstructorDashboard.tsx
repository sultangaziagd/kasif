
import React, { useState, useEffect } from 'react';
import { 
  FaUserCheck, FaBookOpen, FaMicrophone, FaChartPie, 
  FaTasks, FaBullhorn, FaSignOutAlt, FaChevronRight, FaArrowLeft, FaTimes, FaCheck, 
  FaShoppingBasket, FaTrash, FaPlus, FaUsers, FaUser, FaMedal, FaFilter, FaStar, FaCoins, FaPalette, FaSave, FaBell, FaMosque, FaCopy, FaUserPlus, FaExclamationCircle, FaPhone, FaMapMarkerAlt, FaSchool, FaEdit, FaCog, FaCalendarPlus, FaClock, FaMapPin, FaFileAlt
} from 'react-icons/fa';
import { Student, MarketItem, WeeklyTask, Announcement, Badge, Instructor, PendingItem, AppEvent, WeeklyReport } from '../types';
import { SURAH_LIST, PRAYER_TIMES } from '../constants';

interface InstructorDashboardProps {
  instructor: Instructor;
  students: Student[];
  updateStudent: (id: number, updater: (s: Student) => Student) => void;
  updateInstructor: (id: number, updater: (i: Instructor) => Instructor) => void;
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  onLogout: () => void;
  marketItems: MarketItem[];
  setMarketItems: (items: MarketItem[]) => void;
  tasks: WeeklyTask[];
  setTasks: (tasks: WeeklyTask[]) => void;
  announcements: Announcement[];
  setAnnouncements: (announcements: Announcement[]) => void;
  badges: Badge[];
  setBadges: (badges: Badge[]) => void;
  events: AppEvent[];
  setEvents: (events: AppEvent[]) => void;
  reports: WeeklyReport[];
  setReports: (reports: WeeklyReport[]) => void;
}

export default function InstructorDashboard({ 
  instructor, students, updateStudent, updateInstructor, setStudents, onLogout,
  marketItems, setMarketItems, tasks, setTasks, announcements, setAnnouncements,
  badges, setBadges, events, setEvents, reports, setReports
}: InstructorDashboardProps) {
  const [activeTab, setActiveTab] = useState<'academic' | 'karne' | 'groups' | 'management' | 'approvals'>('academic');
  const [academicView, setAcademicView] = useState<'attendance' | 'reading' | 'memorization'>('attendance');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedDate] = useState(new Date());
  
  // Student Detail Modal State
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [readingAssignmentInput, setReadingAssignmentInput] = useState('');
  const [detailTab, setDetailTab] = useState<'academic' | 'spiritual_detail' | 'badges'>('academic');

  // Edit Student Modal State
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // Manual Student Registration State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newStudentData, setNewStudentData] = useState({
     fullName: '', username: '', password: '', classCode: '', parentPhone: '', studentPhone: '', address: '', school: ''
  });

  // Form States
  const [newItem, setNewItem] = useState({ title: '', price: 100, currency: 'GP' as 'GP' | 'NP', icon: '🎁', description: '', stock: 10, classCode: instructor.classCodes[0] || '' });
  const [newTask, setNewTask] = useState({ title: '', reward: 50, currency: 'GP' as 'GP' | 'NP', target: 1 });
  const [newBadge, setNewBadge] = useState({ title: '', icon: '🏅', value: 100, currency: 'GP' as 'GP' | 'NP', description: '' });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', targetGroup: instructor.classCodes[0] || '' });

  // Event & Report Form States
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '', location: '', classCode: instructor.classCodes[0] || '' });
  const [newReport, setNewReport] = useState({ isHeld: true, attendeeCount: 0, location: '', notes: '' });

  // Notification State
  const [notification, setNotification] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({ show: false, type: 'success', message: '' });

  // Close details when tab changes
  useEffect(() => {
    setSelectedStudentForDetail(null);
    setStudentToEdit(null);
  }, [activeTab, academicView]);

  useEffect(() => {
    // Update default selected class code if instructor adds new codes
    if (instructor.classCodes.length > 0) {
       if (!newEvent.classCode) setNewEvent(prev => ({...prev, classCode: instructor.classCodes[0]}));
       if (!newItem.classCode) setNewItem(prev => ({...prev, classCode: instructor.classCodes[0]}));
    }
  }, [instructor.classCodes]);

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

  const dateKey = selectedDate.toISOString().split('T')[0];
  const filteredStudents = selectedGroup === 'all' 
    ? students 
    : students.filter(s => s.classCode === selectedGroup);

  const pendingStudents = filteredStudents.filter(s => s.status === 'pending');
  const approvedStudents = filteredStudents.filter(s => s.status === 'approved');

  const studentsWithPendingTasks = approvedStudents.filter(s => s.pendingTasks && s.pendingTasks.length > 0);
  const studentsWithPendingItems = approvedStudents.filter(s => s.pendingItems && s.pendingItems.length > 0);
  
  const totalPendingCount = studentsWithPendingTasks.length + studentsWithPendingItems.length + pendingStudents.length;

  const generateNewCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    if (instructor.classCodes.includes(code)) {
      generateNewCode();
      return;
    }
    updateInstructor(instructor.id, prev => ({
      ...prev,
      classCodes: [...prev.classCodes, code]
    }));
    setActiveTab('groups');
    showNotification('success', 'Yeni grup kodu oluşturuldu.');
  };

  const deleteGroupCode = (codeToDelete: string) => {
    if(window.confirm(`${codeToDelete} kodlu grubu ve bu gruba bağlı TÜM etkinlikleri/duyuruları silmek istediğinize emin misiniz?`)) {
      updateInstructor(instructor.id, prev => ({
        ...prev,
        classCodes: prev.classCodes.filter(c => c !== codeToDelete)
      }));
      showNotification('success', 'Grup kodu silindi.');
    }
  };

  const handleManualRegister = () => {
      if (!newStudentData.fullName || !newStudentData.username || !newStudentData.password || !newStudentData.classCode) {
          showNotification('error', 'Lütfen zorunlu alanları doldurun.');
          return;
      }
      
      // Duplicate check
      if (students.find(s => s.username === newStudentData.username)) {
          showNotification('error', 'Bu kullanıcı adı zaten alınmış.');
          return;
      }

      const newStudent: Student = {
        id: Date.now(),
        name: newStudentData.fullName,
        username: newStudentData.username,
        password: newStudentData.password,
        group: 'Kaşif Grubu',
        status: 'approved', // Instructor adds, so it's auto-approved
        classCode: newStudentData.classCode,
        parentPhone: newStudentData.parentPhone,
        studentPhone: newStudentData.studentPhone,
        address: newStudentData.address,
        school: newStudentData.school,
        points: 0,
        namazPoints: 0,
        inventory: [],
        pendingItems: [],
        badges: [],
        completedTasks: [],
        pendingTasks: [],
        attendance: {},
        reading: {},
        memorization: {},
        prayers: {}
      };
      
      setStudents(prev => [...prev, newStudent]);
      setNewStudentData({ fullName: '', username: '', password: '', classCode: '', parentPhone: '', studentPhone: '', address: '', school: '' });
      setShowRegisterModal(false);
      showNotification('success', 'Kaşif başarıyla kaydedildi.');
  };

  const handleStatusChange = (studentId: number, type: 'attendance' | 'reading', value: string) => {
    updateStudent(studentId, (s: Student) => ({
      ...s,
      [type]: { ...s[type], [dateKey]: value }
    }));
  };
  
  const handleMemorizationChange = (studentId: number, surahId: string, value: 'passed' | 'repeat' | 'none') => {
    updateStudent(studentId, s => ({
      ...s,
      memorization: { ...s.memorization, [surahId]: value }
    }));
    if (selectedStudentForDetail && selectedStudentForDetail.id === studentId) {
      setSelectedStudentForDetail(prev => prev ? ({
        ...prev,
        memorization: { ...prev.memorization, [surahId]: value }
      }) : null);
    }
  };

  const saveReadingAssignment = () => {
    if (selectedStudentForDetail) {
      updateStudent(selectedStudentForDetail.id, s => ({
        ...s,
        readingAssignment: readingAssignmentInput
      }));
      showNotification('success', 'Ödev kaydedildi!');
      setSelectedStudentForDetail(prev => prev ? ({ ...prev, readingAssignment: readingAssignmentInput }) : null);
    }
  };

  const openStudentDetail = (student: Student, defaultTab: 'academic' | 'spiritual_detail' | 'badges' = 'academic') => {
    setSelectedStudentForDetail(student);
    setReadingAssignmentInput(student.readingAssignment || '');
    setDetailTab(defaultTab);
  };

  const closeStudentDetail = () => {
    setSelectedStudentForDetail(null);
  };

  // EDIT STUDENT FUNCTIONS
  const openEditStudent = (student: Student, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudentToEdit(student);
    setEditFormData({
      name: student.name,
      username: student.username,
      password: student.password,
      parentPhone: student.parentPhone || '',
      studentPhone: student.studentPhone || '',
      address: student.address || '',
      school: student.school || ''
    });
  };

  const handleQuickDelete = (student: Student, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm(`${student.name} adlı kaşifi silmek istediğinize emin misiniz?`)) {
      setStudents(prev => prev.filter(s => s.id !== student.id));
      showNotification('success', 'Kaşif silindi.');
    }
  };

  const handleCallParent = (phone: string | undefined, e: React.MouseEvent) => {
    e.stopPropagation();
    if(!phone) {
        showNotification('error', 'Telefon numarası kayıtlı değil.');
        return;
    }
    window.location.href = `tel:${phone}`;
  };

  const saveStudentEdit = () => {
    if(!studentToEdit) return;
    if(!editFormData.name || !editFormData.username || !editFormData.password) {
      showNotification('error', 'Temel bilgiler boş olamaz.');
      return;
    }
    
    updateStudent(studentToEdit.id, s => ({
      ...s,
      ...editFormData
    }));
    setStudentToEdit(null);
    showNotification('success', 'Kaşif bilgileri güncellendi.');
  };

  const deleteStudent = () => {
    if(!studentToEdit) return;
    if(window.confirm(`${studentToEdit.name} adlı kaşifi ve tüm verilerini silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`)) {
      setStudents(prev => prev.filter(s => s.id !== studentToEdit.id));
      setStudentToEdit(null);
      showNotification('success', 'Kaşif silindi.');
    }
  };

  const approveStudent = (studentId: number) => {
    updateStudent(studentId, s => ({ ...s, status: 'approved' }));
    showNotification('success', 'Kaşif onaylandı.');
  };

  const rejectStudent = (studentId: number) => {
    if (window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      showNotification('success', 'Kayıt silindi.');
    }
  };

  const giveBadgeToStudent = (badgeId: string) => {
    if (!selectedStudentForDetail) return;
    if (selectedStudentForDetail.badges.includes(badgeId)) {
      showNotification('error', "Kaşif bu rozete zaten sahip.");
      return;
    }

    const badge = badges.find(b => b.id === badgeId);
    if (badge) {
      updateStudent(selectedStudentForDetail.id, s => ({
        ...s,
        badges: [...s.badges, badgeId],
        points: badge.currency === 'GP' ? s.points + badge.value : s.points,
        namazPoints: badge.currency === 'NP' ? s.namazPoints + badge.value : s.namazPoints
      }));
      setSelectedStudentForDetail(prev => prev ? ({
        ...prev,
        badges: [...prev.badges, badgeId]
      }) : null);
      showNotification('success', 'Rozet verildi.');
    }
  };

  const removeBadgeFromStudent = (badgeId: string) => {
    if (!selectedStudentForDetail) return;
    if (window.confirm("Rozeti geri almak istediğine emin misin? Puanlar silinmeyecek.")) {
      updateStudent(selectedStudentForDetail.id, s => ({
        ...s,
        badges: s.badges.filter(id => id !== badgeId)
      }));
      setSelectedStudentForDetail(prev => prev ? ({
        ...prev,
        badges: prev.badges.filter(id => id !== badgeId)
      }) : null);
      showNotification('success', 'Rozet geri alındı.');
    }
  };

  const approveTask = (studentId: number, taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    updateStudent(studentId, s => ({
      ...s,
      pendingTasks: s.pendingTasks.filter(id => id !== taskId),
      completedTasks: [...s.completedTasks, taskId],
      points: task.currency === 'GP' ? s.points + task.reward : s.points,
      namazPoints: task.currency === 'NP' ? s.namazPoints + task.reward : s.namazPoints
    }));
    showNotification('success', 'Görev onaylandı.');
  };

  const rejectTask = (studentId: number, taskId: number) => {
    updateStudent(studentId, s => ({
      ...s,
      pendingTasks: s.pendingTasks.filter(id => id !== taskId)
    }));
    showNotification('success', 'Görev reddedildi.');
  };

  const approveItem = (studentId: number, pItem: PendingItem) => {
    const marketItem = marketItems.find(i => i.id === pItem.itemId);
    if (marketItem && marketItem.stock <= 0) {
      showNotification('error', "Stok yetersiz!");
      return;
    }
    if (marketItem) {
      const newItems = marketItems.map(i => i.id === marketItem.id ? { ...i, stock: i.stock - 1 } : i);
      setMarketItems(newItems);
    }
    updateStudent(studentId, s => ({
      ...s,
      pendingItems: s.pendingItems.filter(i => i.id !== pItem.id),
      inventory: [...s.inventory, pItem.itemId]
    }));
    showNotification('success', 'Ürün teslim edildi.');
  };

  const rejectItem = (studentId: number, pItem: PendingItem) => {
    updateStudent(studentId, s => ({
      ...s,
      pendingItems: s.pendingItems.filter(i => i.id !== pItem.id),
      points: pItem.currency === 'GP' ? s.points + pItem.price : s.points,
      namazPoints: pItem.currency === 'NP' ? s.namazPoints + pItem.price : s.namazPoints
    }));
    showNotification('success', 'İptal edildi, puan iade edildi.');
  };

  const addBadge = () => {
    if(!newBadge.title) return;
    const badge: Badge = { id: Date.now().toString(), ...newBadge };
    setBadges([...badges, badge]);
    setNewBadge({ title: '', icon: '🏅', value: 100, currency: 'GP', description: '' });
    showNotification('success', 'Rozet eklendi.');
  };

  const deleteBadge = (id: string) => {
      if(window.confirm("Bu rozeti silmek istediğine emin misin?")) {
        setBadges(badges.filter(b => b.id !== id));
        showNotification('success', 'Rozet silindi.');
      }
  };

  const addMarketItem = () => {
    if (!newItem.title || !newItem.classCode) {
        showNotification('error', 'Lütfen başlık ve grup seçimi yapın.');
        return;
    }
    const item: MarketItem = { id: Date.now().toString(), ...newItem };
    setMarketItems([...marketItems, item]);
    setNewItem({ title: '', price: 100, currency: 'GP', icon: '🎁', description: '', stock: 10, classCode: instructor.classCodes[0] || '' });
    showNotification('success', 'Ürün eklendi.');
  };

  const deleteMarketItem = (id: string) => {
      if(window.confirm("Bu ürünü silmek istediğine emin misin?")) {
          setMarketItems(marketItems.filter(i => i.id !== id));
          showNotification('success', 'Ürün silindi.');
      }
  };

  const addWeeklyTask = () => {
    if (!newTask.title) return;
    const task: WeeklyTask = { id: Date.now(), ...newTask };
    setTasks([...tasks, task]);
    setNewTask({ title: '', reward: 50, currency: 'GP', target: 1 });
    showNotification('success', 'Görev eklendi.');
  };

  const deleteWeeklyTask = (id: number) => {
      if(window.confirm("Bu görevi silmek istediğine emin misin?")) {
          setTasks(tasks.filter(t => t.id !== id));
          showNotification('success', 'Görev silindi.');
      }
  };

  const addAnnouncement = () => {
    if(!newAnnouncement.title || !newAnnouncement.message || !newAnnouncement.targetGroup) {
      showNotification('error', "Lütfen tüm alanları doldurun.");
      return;
    }
    const ann: Announcement = { 
      id: Date.now(), 
      title: newAnnouncement.title, 
      message: newAnnouncement.message,
      date: new Date().toLocaleDateString('tr-TR'),
      classCode: newAnnouncement.targetGroup
    };
    setAnnouncements([ann, ...announcements]);
    setNewAnnouncement({ title: '', message: '', targetGroup: instructor.classCodes[0] || '' });
    showNotification('success', 'Duyuru yayınlandı.');
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.classCode) {
      showNotification('error', "Lütfen gerekli alanları doldurun.");
      return;
    }
    const evt: AppEvent = {
      id: Date.now(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location,
      classCode: newEvent.classCode,
      createdBy: 'instructor'
    };
    setEvents([...events, evt]);
    setNewEvent({ title: '', description: '', date: '', time: '', location: '', classCode: instructor.classCodes[0] || '' });
    showNotification('success', 'Etkinlik oluşturuldu.');
  };

  const deleteEvent = (id: number) => {
    if(window.confirm("Bu etkinliği iptal etmek istediğine emin misin?")) {
      setEvents(events.filter(e => e.id !== id));
      showNotification('success', 'Etkinlik silindi.');
    }
  };

  const submitReport = () => {
    const report: WeeklyReport = {
      id: Date.now(),
      instructorId: instructor.id,
      instructorName: instructor.name,
      reportDate: new Date().toISOString().split('T')[0],
      ...newReport
    };
    setReports([report, ...reports]);
    setNewReport({ isHeld: true, attendeeCount: 0, location: '', notes: '' });
    showNotification('success', 'Haftalık rapor iletildi.');
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  };

  return (
    <div className="pb-32 bg-gray-50 min-h-screen font-sans">
      
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

      <header className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-6 rounded-b-[2.5rem] shadow-lg sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest opacity-70">Selamün Aleyküm,</p>
            <h2 className="text-2xl font-black">{instructor.name}</h2>
            <div className="text-blue-200 text-xs font-medium">@{instructor.username}</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('approvals')} className="relative bg-white/10 p-3 rounded-2xl backdrop-blur-md hover:bg-white/20 transition">
              <FaBell />
              {totalPendingCount > 0 && (
                <span className="absolute top-2 right-2 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[9px] font-bold items-center justify-center border-2 border-white">{totalPendingCount}</span>
                </span>
              )}
            </button>
            <button onClick={onLogout} className="bg-white/10 p-3 rounded-2xl backdrop-blur-md hover:bg-white/20 transition">
              <FaSignOutAlt />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-4">
           <div className="flex-1 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 flex items-center gap-2">
              <div className="bg-blue-500 p-2 rounded-xl"><FaFilter className="text-xs" /></div>
              <select value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} className="bg-transparent text-white font-bold text-sm outline-none flex-1">
                <option value="all" className="text-gray-800">Tüm Gruplar</option>
                {instructor.classCodes.map(code => <option key={code} value={code} className="text-gray-800">Grup: {code}</option>)}
              </select>
           </div>
        </div>
      </header>

      <main className="p-5 max-w-4xl mx-auto">
        {activeTab === 'approvals' && (
           <div className="animate-fade-in space-y-6">
              <h3 className="font-black text-gray-800 text-lg flex items-center gap-2"><FaBell className="text-indigo-500" /> Onay Bekleyenler</h3>
              {totalPendingCount === 0 && <div className="text-center py-10 text-gray-400">Onay bekleyen işlem yok. Harika! 🎉</div>}
              
              {/* PENDING REGISTRATIONS */}
              {pendingStudents.length > 0 && (
                <div className="space-y-4">
                   <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaUserPlus /> Yeni Kaşif Kayıtları</h4>
                   {pendingStudents.map(s => (
                      <div key={s.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-emerald-500 flex justify-between items-center animate-fade-in-up">
                         <div>
                           <div className="font-black text-gray-800 text-lg">{s.name}</div>
                           <div className="text-xs font-bold text-blue-500 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded-md inline-block mt-1">Grup: {s.classCode}</div>
                           <div className="text-[10px] text-gray-400 mt-0.5">@{s.username}</div>
                         </div>
                         <div className="flex gap-2">
                           <button onClick={() => rejectStudent(s.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"><FaTimes /></button>
                           <button onClick={() => approveStudent(s.id)} className="px-5 py-3 bg-emerald-500 text-white rounded-xl font-black text-xs shadow-lg hover:bg-emerald-600 transition">ONAYLA</button>
                         </div>
                      </div>
                   ))}
                </div>
              )}

              {/* PENDING TASKS */}
              {studentsWithPendingTasks.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaTasks /> Görev Onayları</h4>
                  {studentsWithPendingTasks.map(student => (
                     student.pendingTasks.map(taskId => {
                       const task = tasks.find(t => t.id === taskId);
                       if (!task) return null;
                       return (
                         <div key={`${student.id}-${taskId}`} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-purple-500 flex justify-between items-center">
                            <div>
                               <div className="font-bold text-gray-800">{student.name}</div>
                               <div className="text-sm text-gray-600">Görev: {task.title}</div>
                               <div className="text-xs text-purple-500 font-bold">Ödül: {task.reward} {task.currency}</div>
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => rejectTask(student.id, taskId)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"><FaTimes /></button>
                               <button onClick={() => approveTask(student.id, taskId)} className="px-5 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition">Onayla</button>
                            </div>
                         </div>
                       )
                     })
                  ))}
                </div>
              )}

              {/* PENDING MARKET ITEMS */}
              {studentsWithPendingItems.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><FaShoppingBasket /> Market Teslimatları</h4>
                  {studentsWithPendingItems.map(student => (
                     student.pendingItems.map(pItem => (
                       <div key={pItem.id} className="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-amber-500 flex justify-between items-center">
                          <div>
                             <div className="font-bold text-gray-800">{student.name}</div>
                             <div className="text-sm text-gray-600">Ürün: {pItem.itemTitle}</div>
                             <div className="text-xs text-amber-500 font-bold">Ödenen: {pItem.price} {pItem.currency}</div>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => rejectItem(student.id, pItem)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"><FaTimes /></button>
                             <button onClick={() => approveItem(student.id, pItem)} className="px-5 py-3 bg-amber-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition">Teslim Et</button>
                          </div>
                       </div>
                     ))
                  ))}
                </div>
              )}
           </div>
        )}

        {/* ... (Existing tabs: academic, karne, groups remain unchanged) ... */}
        {activeTab === 'academic' && (
          <div className="animate-fade-in">
             <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex mb-6">
                {[{ id: 'attendance', label: 'Yoklama', icon: <FaUserCheck /> }, { id: 'reading', label: 'Yüzüne', icon: <FaBookOpen /> }, { id: 'memorization', label: 'Ezber', icon: <FaMicrophone /> }].map((tab) => (
                  <button key={tab.id} onClick={() => setAcademicView(tab.id as any)} className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${academicView === tab.id ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-400'}`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
             </div>

             <div className="space-y-3">
               {approvedStudents.map(s => {
                  const status = academicView === 'attendance' ? (s.attendance[dateKey] || 'none') : (s.reading[dateKey] || 'none');
                  return (
                    <div 
                      key={s.id} 
                      onClick={() => openStudentDetail(s, 'academic')}
                      className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg ${academicView === 'memorization' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-500'}`}>
                          {s.name.charAt(0)}
                        </div>
                        <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                           {s.name}
                        </div>
                      </div>

                      {(academicView === 'attendance' || academicView === 'reading') && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => handleStatusChange(s.id, academicView as any, (status === 'present' || status === 'passed') ? 'none' : (academicView === 'attendance' ? 'present' : 'passed'))} className={`p-3 rounded-xl transition ${(status === 'present' || status === 'passed') ? 'bg-emerald-500 text-white shadow-lg' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'}`}><FaCheck /></button>
                          <button onClick={() => handleStatusChange(s.id, academicView as any, (status === 'absent' || status === 'failed') ? 'none' : (academicView === 'attendance' ? 'absent' : 'failed'))} className={`p-3 rounded-xl transition ${(status === 'absent' || status === 'failed') ? 'bg-red-500 text-white shadow-lg' : 'bg-gray-100 text-gray-300 hover:bg-gray-200'}`}><FaTimes /></button>
                        </div>
                      )}
                      
                      {academicView === 'memorization' && <FaChevronRight className="text-gray-300" />}
                    </div>
                  );
               })}
             </div>
          </div>
        )}

        {activeTab === 'karne' && (
           <div className="space-y-3">
              {approvedStudents.map(s => (
                <div key={s.id} onClick={() => openStudentDetail(s, 'spiritual_detail')} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group cursor-pointer hover:border-emerald-300 hover:shadow-md transition">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:bg-emerald-500 group-hover:text-white transition">{s.name.charAt(0)}</div>
                     <div>
                       <div className="flex items-center gap-2">
                           <h3 className="font-bold text-gray-800">{s.name}</h3>
                           <button onClick={(e) => openEditStudent(s, e)} className="text-gray-300 hover:text-blue-500 text-xs"><FaEdit /></button>
                       </div>
                       <p className="text-[10px] font-black text-emerald-600 uppercase">Puan: {s.points} GP / {s.namazPoints} NP</p>
                     </div>
                   </div>
                   <FaChevronRight className="text-gray-300" />
                </div>
              ))}
           </div>
        )}

        {activeTab === 'groups' && (
          <div className="animate-fade-in space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
               <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-50 rounded-full -ml-10 -mb-10 opacity-50"></div>
               
               <div className="relative z-10">
                 <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6"><FaPlus /></div>
                 <h3 className="text-2xl font-black text-gray-800 mb-2">Yeni Grup Kodu</h3>
                 <p className="text-sm text-gray-400 mb-6 px-4">Kaşiflerinize vermek için yeni bir benzersiz kod oluşturun.</p>
                 <button onClick={generateNewCode} className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] font-black shadow-2xl active:scale-95 text-lg hover:bg-blue-700 transition">Kod Oluştur</button>
               </div>
            </div>

            {/* REGISTER NEW STUDENT BUTTON */}
            <button onClick={() => setShowRegisterModal(true)} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-600 transition flex items-center justify-center gap-2">
                <FaUserPlus /> Panelden Yeni Kaşif Kaydet
            </button>

            {/* LIST OF ACTIVE CODES */}
            <div className="space-y-4">
              <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest px-2">Aktif Sınıf Kodları ({instructor.classCodes.length})</h3>
              <div className="grid grid-cols-1 gap-3">
                 {instructor.classCodes.map(code => (
                   <div key={code} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl font-mono font-black text-lg tracking-widest">{code}</div>
                         <div>
                            <div className="text-xs font-bold text-gray-400 uppercase">Grup Kodu</div>
                            <div className="text-sm font-bold text-gray-800">Aktif</div>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button 
                           onClick={() => { navigator.clipboard.writeText(code); showNotification('success', 'Kod Kopyalandı'); }}
                           className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition" 
                           title="Kopyala"
                         >
                           <FaCopy />
                         </button>
                         <button 
                           onClick={() => deleteGroupCode(code)}
                           className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"
                           title="Sil"
                         >
                           <FaTrash />
                         </button>
                      </div>
                   </div>
                 ))}
                 {instructor.classCodes.length === 0 && <div className="text-center py-6 text-gray-400 text-sm">Henüz oluşturulmuş bir grup kodu yok.</div>}
              </div>
            </div>
            
            {/* Student List for Edit/Delete */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest px-2">Kayıtlı Kaşifler</h3>
                {approvedStudents.map(s => (
                    <div key={s.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                        <div>
                            <div className="font-bold text-gray-800 text-sm">{s.name}</div>
                            <div className="text-xs text-gray-400">@{s.username} • {s.classCode}</div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={(e) => handleCallParent(s.parentPhone, e)} className="bg-emerald-100 p-2 rounded-lg text-emerald-500 hover:text-emerald-700 transition"><FaPhone /></button>
                            <button onClick={(e) => openEditStudent(s, e)} className="bg-slate-100 p-2 rounded-lg text-slate-500 hover:text-blue-600 transition"><FaEdit /></button>
                            <button onClick={(e) => handleQuickDelete(s, e)} className="bg-red-100 p-2 rounded-lg text-red-500 hover:text-red-700 transition"><FaTrash /></button>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'management' && (
          <div className="animate-fade-in space-y-12 pb-10">
            {/* 1. WEEKLY REPORT SECTION (NEW) */}
            <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-10 -mt-10 opacity-60"></div>
                <h3 className="font-black text-indigo-600 text-xs uppercase mb-6 tracking-widest flex items-center gap-2 relative z-10"><FaFileAlt /> Haftalık Kaşif Raporu</h3>
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                        <span className="text-sm font-bold text-indigo-900">Bu hafta kaşif buluşması yapıldı mı?</span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setNewReport({...newReport, isHeld: true})} 
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${newReport.isHeld ? 'bg-emerald-500 text-white' : 'bg-white text-gray-400'}`}
                            >Evet</button>
                            <button 
                                onClick={() => setNewReport({...newReport, isHeld: false})} 
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${!newReport.isHeld ? 'bg-red-500 text-white' : 'bg-white text-gray-400'}`}
                            >Hayır</button>
                        </div>
                    </div>
                    
                    {newReport.isHeld && (
                        <div className="grid grid-cols-2 gap-3">
                             <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Katılımcı Sayısı</label>
                                <input type="number" value={newReport.attendeeCount} onChange={e => setNewReport({...newReport, attendeeCount: Number(e.target.value)})} className="w-full bg-transparent outline-none font-bold text-gray-800" />
                             </div>
                             <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Yer / Mekan</label>
                                <input type="text" value={newReport.location} onChange={e => setNewReport({...newReport, location: e.target.value})} className="w-full bg-transparent outline-none font-bold text-gray-800" placeholder="Örn: Cami, Park" />
                             </div>
                        </div>
                    )}
                    
                    <textarea 
                        placeholder="Rapor notları..." 
                        value={newReport.notes} 
                        onChange={e => setNewReport({...newReport, notes: e.target.value})} 
                        className="w-full bg-gray-50 p-4 rounded-2xl outline-none text-sm h-24 border border-gray-100" 
                    />
                    
                    <button onClick={submitReport} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-200">Raporu Gönder</button>
                </div>
            </section>

            {/* 2. ACTIVITY/EVENT MANAGEMENT (NEW - ABOVE TASKS) */}
            <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="font-black text-orange-500 text-xs uppercase mb-6 tracking-widest flex items-center gap-2"><FaCalendarPlus /> Etkinlik Planla</h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Etkinlik Adı" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="col-span-2 bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" />
                        <div className="relative">
                             <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                             <input type="date" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-gray-50 p-4 pl-10 rounded-2xl outline-none text-xs font-bold" />
                        </div>
                        <div className="relative">
                             <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                             <input type="time" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="w-full bg-gray-50 p-4 pl-10 rounded-2xl outline-none text-xs font-bold" />
                        </div>
                    </div>
                    <div className="relative">
                        <FaMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input type="text" placeholder="Konum" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} className="w-full bg-gray-50 p-4 pl-10 rounded-2xl outline-none text-sm" />
                    </div>
                    <textarea placeholder="Etkinlik detayları..." value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none text-sm h-20" />
                    
                    <select value={newEvent.classCode} onChange={e => setNewEvent({...newEvent, classCode: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold text-sm">
                        {instructor.classCodes.map(code => <option key={code} value={code}>Grup: {code}</option>)}
                    </select>

                    <button onClick={addEvent} className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-200">Etkinliği Yayınla</button>
                </div>

                {/* List Active Events */}
                <div className="mt-6 space-y-2">
                    {events.filter(e => instructor.classCodes.includes(e.classCode)).map(evt => (
                        <div key={evt.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                             <div>
                                 <h4 className="font-bold text-orange-900 text-sm">{evt.title}</h4>
                                 <p className="text-xs text-orange-700 flex items-center gap-2 mt-1">
                                    <span>{evt.date} {evt.time}</span> • <span>{evt.location}</span>
                                 </p>
                                 <span className="text-[10px] bg-white px-2 py-0.5 rounded text-orange-400 font-bold mt-1 inline-block">{evt.classCode}</span>
                             </div>
                             <button onClick={() => deleteEvent(evt.id)} className="text-orange-400 hover:text-red-500"><FaTrash /></button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. ROZET TANIMLAMA */}
            <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h3 className="font-black text-purple-600 text-xs uppercase mb-6 tracking-widest flex items-center gap-2"><FaMedal /> Rozet Tanımla</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <input type="text" placeholder="Rozet Adı" value={newBadge.title} onChange={e => setNewBadge({...newBadge, title: e.target.value})} className="col-span-2 bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" />
                <input type="text" placeholder="Emoji" value={newBadge.icon} onChange={e => setNewBadge({...newBadge, icon: e.target.value})} className="bg-gray-50 p-4 rounded-2xl text-center outline-none" />
                <input type="number" placeholder="Puan" value={newBadge.value} onChange={e => setNewBadge({...newBadge, value: Number(e.target.value)})} className="bg-gray-50 p-4 rounded-2xl outline-none" />
                <select value={newBadge.currency} onChange={e => setNewBadge({...newBadge, currency: e.target.value as any})} className="col-span-2 bg-gray-50 p-4 rounded-2xl outline-none font-bold">
                  <option value="GP">GP (Genel Puan)</option>
                  <option value="NP">NP (Namaz Puanı)</option>
                </select>
                <button onClick={addBadge} className="col-span-2 bg-purple-600 text-white py-4 rounded-2xl font-black shadow-lg">Rozet Ekle</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {badges.map(b => (
                  <div key={b.id} className={`bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2`}>
                    {b.icon} {b.title} <span className="opacity-60">({b.value} {b.currency})</span>
                    <button onClick={() => deleteBadge(b.id)} className="text-red-400 hover:text-red-200 ml-1"><FaTimes /></button>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. GÖREV EKLEME */}
            <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
               <h3 className="font-black text-blue-600 text-xs uppercase mb-6 tracking-widest flex items-center gap-2"><FaTasks /> Haftalık Görev</h3>
               <div className="space-y-3 mb-6">
                  <input type="text" placeholder="Görev Başlığı" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Ödül" value={newTask.reward} onChange={e => setNewTask({...newTask, reward: Number(e.target.value)})} className="bg-gray-50 p-4 rounded-2xl outline-none" />
                    <select value={newTask.currency} onChange={e => setNewTask({...newTask, currency: e.target.value as any})} className="bg-gray-50 p-4 rounded-2xl outline-none">
                      <option value="GP">GP</option>
                      <option value="NP">NP</option>
                    </select>
                  </div>
                  <button onClick={addWeeklyTask} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">Görev Tanımla</button>
               </div>
               <div className="space-y-2">
                  {tasks.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="text-xs font-bold">{t.title} - {t.reward} {t.currency}</span>
                      <button onClick={() => deleteWeeklyTask(t.id)} className="text-red-500"><FaTrash /></button>
                    </div>
                  ))}
               </div>
            </section>

            {/* 5. MARKET YÖNETİMİ */}
            <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
               <h3 className="font-black text-amber-600 text-xs uppercase mb-6 tracking-widest flex items-center gap-2"><FaShoppingBasket /> Market Ürünleri</h3>
               <div className="grid grid-cols-2 gap-3 mb-6">
                  <input type="text" placeholder="Ürün Adı" value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} className="col-span-2 bg-gray-50 p-4 rounded-2xl font-bold text-sm outline-none" />
                  <input type="text" placeholder="Açıklama (Kısa)" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} className="col-span-2 bg-gray-50 p-4 rounded-2xl text-xs outline-none" />
                  <div className="grid grid-cols-2 gap-3 col-span-2">
                      <input type="number" placeholder="Fiyat" value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} className="bg-gray-50 p-4 rounded-2xl outline-none" />
                      <input type="number" placeholder="Stok" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: Number(e.target.value)})} className="bg-gray-50 p-4 rounded-2xl outline-none" />
                  </div>
                  <div className="col-span-2 bg-gray-50 p-2 rounded-2xl border border-dashed border-gray-200">
                     <label className="text-[10px] uppercase font-bold text-gray-400 ml-2">Ürün Görseli (Emoji)</label>
                     <input type="text" placeholder="Örn: 🍔, ⚽, 📚" value={newItem.icon} onChange={e => setNewItem({...newItem, icon: e.target.value})} className="w-full bg-transparent p-2 text-center text-2xl outline-none" />
                  </div>
                  
                  <select value={newItem.classCode} onChange={e => setNewItem({...newItem, classCode: e.target.value})} className="bg-gray-50 p-4 rounded-2xl outline-none font-bold col-span-2 text-sm">
                        {instructor.classCodes.map(code => <option key={code} value={code}>Hangi Grup İçin? ({code})</option>)}
                  </select>

                  <select value={newItem.currency} onChange={e => setNewItem({...newItem, currency: e.target.value as any})} className="bg-gray-50 p-4 rounded-2xl outline-none font-bold col-span-2">
                    <option value="GP">GP</option>
                    <option value="NP">NP</option>
                  </select>
                  <button onClick={addMarketItem} className="col-span-2 bg-amber-500 text-white py-4 rounded-2xl font-black shadow-lg">Ürün Ekle</button>
               </div>
               
               {/* LIST (Filtered by Selected Group) */}
               <div className="space-y-2">
                 {/* Eğer 'Tüm Gruplar' seçiliyse hepsini göster, değilse sadece seçili grubu göster */}
                 {marketItems
                    .filter(i => selectedGroup === 'all' ? true : i.classCode === selectedGroup)
                    .map(item => (
                   <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                     <div className="flex flex-col">
                        <span className="text-xs font-bold">{item.icon} {item.title}</span>
                        <span className="text-[10px] text-gray-400">{item.description} • {item.price} {item.currency} • Stok: {item.stock}</span>
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-1 rounded inline-block w-fit mt-1">Grup: {item.classCode}</span>
                     </div>
                     <button onClick={() => deleteMarketItem(item.id)} className="text-red-500"><FaTrash /></button>
                   </div>
                 ))}
                 {marketItems.filter(i => selectedGroup === 'all' ? true : i.classCode === selectedGroup).length === 0 && (
                    <div className="text-center text-gray-400 text-xs py-4">Bu grup için market ürünü yok.</div>
                 )}
               </div>
            </section>

            {/* 6. DUYURU YAYINLAMA */}
            <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
               <h3 className="font-black text-rose-600 text-xs uppercase mb-6 tracking-widest flex items-center gap-2"><FaBullhorn /> Duyuru Panosu</h3>
               <div className="space-y-4">
                  <select value={newAnnouncement.targetGroup} onChange={e => setNewAnnouncement({...newAnnouncement, targetGroup: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold text-sm">
                    {instructor.classCodes.map(code => <option key={code} value={code}>Grup: {code}</option>)}
                  </select>
                  <input type="text" placeholder="Başlık" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none font-bold" />
                  <textarea placeholder="Mesaj..." value={newAnnouncement.message} onChange={e => setNewAnnouncement({...newAnnouncement, message: e.target.value})} className="w-full bg-gray-50 p-4 rounded-2xl outline-none h-24" />
                  <button onClick={addAnnouncement} className="w-full bg-rose-500 text-white py-4 rounded-2xl font-black shadow-lg">Duyuruyu Yayınla</button>
               </div>
               
               {/* List Announcements (Filtered) */}
               <div className="mt-6 space-y-2">
                    {announcements.filter(a => selectedGroup === 'all' ? true : a.classCode === selectedGroup).map(ann => (
                        <div key={ann.id} className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                             <h4 className="font-bold text-rose-900 text-sm">{ann.title}</h4>
                             <p className="text-xs text-rose-700 mt-1">{ann.message}</p>
                             <div className="mt-2 flex justify-between items-center">
                                <span className="text-[10px] bg-white px-2 py-0.5 rounded text-rose-400 font-bold">Grup: {ann.classCode}</span>
                                <span className="text-[10px] text-rose-400">{ann.date}</span>
                             </div>
                        </div>
                    ))}
               </div>
            </section>
          </div>
        )}
      </main>

      {/* ... (Student/Edit Modals remain unchanged) ... */}
      
      {/* STUDENT DETAIL MODAL */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="font-black text-xl">{selectedStudentForDetail.name}</h3>
                <div className="text-xs text-slate-400">@{selectedStudentForDetail.username} • {selectedStudentForDetail.classCode}</div>
                <div className="flex gap-2 mt-2 flex-wrap">
                   {activeTab === 'academic' && (
                     <button onClick={() => setDetailTab('academic')} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition bg-white text-slate-900`}>Ders</button>
                   )}
                   {activeTab === 'karne' && (
                     <>
                        <button onClick={() => setDetailTab('spiritual_detail')} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${detailTab === 'spiritual_detail' ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-400'}`}>Namaz Karnesi</button>
                        <button onClick={() => setDetailTab('badges')} className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition ${detailTab === 'badges' ? 'bg-white text-slate-900' : 'bg-white/10 text-slate-400'}`}>Rozetler</button>
                     </>
                   )}
                </div>
              </div>
              <button onClick={closeStudentDetail} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition"><FaTimes /></button>
            </div>
            
            {/* Modal Content - Scrollable */}
            <div className="p-6 overflow-y-auto">
              
              {/* CONTACT INFO CARD - Sadece Karne sekmesinde görünür */}
              {activeTab === 'karne' && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-6 relative">
                  <button onClick={(e) => openEditStudent(selectedStudentForDetail, e)} className="absolute top-4 right-4 text-blue-400 hover:text-blue-600"><FaEdit /></button>
                  <h4 className="text-xs font-black text-blue-600 uppercase mb-2">İletişim & Okul Bilgileri</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                          <span className="text-[10px] font-bold text-gray-400 block uppercase">Veli Tel</span>
                          <a href={`tel:${selectedStudentForDetail.parentPhone}`} className="font-bold text-gray-800 flex items-center gap-1 hover:text-blue-600"><FaPhone className="text-xs"/> {selectedStudentForDetail.parentPhone || '-'}</a>
                      </div>
                      <div>
                          <span className="text-[10px] font-bold text-gray-400 block uppercase">Kaşif Tel</span>
                          <a href={`tel:${selectedStudentForDetail.studentPhone}`} className="font-bold text-gray-800 flex items-center gap-1 hover:text-blue-600"><FaPhone className="text-xs"/> {selectedStudentForDetail.studentPhone || '-'}</a>
                      </div>
                      <div className="col-span-2">
                          <span className="text-[10px] font-bold text-gray-400 block uppercase">Adres</span>
                          <div className="font-bold text-gray-800 flex items-center gap-1"><FaMapMarkerAlt className="text-xs"/> {selectedStudentForDetail.address || '-'}</div>
                      </div>
                      <div className="col-span-2">
                          <span className="text-[10px] font-bold text-gray-400 block uppercase">Okul</span>
                          <div className="font-bold text-gray-800 flex items-center gap-1"><FaSchool className="text-xs"/> {selectedStudentForDetail.school || '-'}</div>
                      </div>
                  </div>
                </div>
              )}

              {/* TAB: ACADEMIC */}
              {detailTab === 'academic' && (
                <>
                  {/* VIEW: Attendance History */}
                  {academicView === 'attendance' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(selectedStudentForDetail.attendance).sort().reverse().map(([date, status]) => (
                          <div key={date} className={`p-2 rounded-xl text-center border ${
                            status === 'present' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 
                            status === 'absent' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-400'
                          }`}>
                             <div className="text-[10px] font-bold text-gray-400">{date.split('-').slice(1).reverse().join('.')}</div>
                             <div className="text-lg mt-1">{status === 'present' ? <FaCheck className="mx-auto" /> : <FaTimes className="mx-auto" />}</div>
                          </div>
                        ))}
                        {Object.keys(selectedStudentForDetail.attendance).length === 0 && <div className="col-span-5 text-center text-gray-400 text-sm py-4">Henüz veri yok.</div>}
                      </div>
                    </div>
                  )}

                  {/* VIEW: Reading & Assignment */}
                  {academicView === 'reading' && (
                    <div className="space-y-6">
                      {/* Assignment Input */}
                      <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                        <label className="block text-xs font-black text-indigo-600 uppercase mb-2">Yeni Yüzüne Ödevi Ver</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={readingAssignmentInput}
                            onChange={(e) => setReadingAssignmentInput(e.target.value)}
                            placeholder="Örn: Bakara 20-30. sayfalar" 
                            className="flex-1 p-3 rounded-xl border border-indigo-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                          />
                          <button onClick={saveReadingAssignment} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition"><FaSave /></button>
                        </div>
                        <p className="text-[10px] text-indigo-400 mt-2 italic">*Bu ödev kaşif panelinde görünecektir.</p>
                      </div>

                      {/* Reading History */}
                      <div>
                        <h4 className="font-bold text-gray-800 mb-3 text-sm">Geçmiş Okumalar</h4>
                        <div className="space-y-2">
                           {Object.entries(selectedStudentForDetail.reading).sort().reverse().map(([date, status]) => (
                             <div key={date} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                               <span className="text-xs font-bold text-gray-500">{date}</span>
                               <span className={`px-2 py-1 rounded-md text-xs font-bold ${status === 'passed' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                 {status === 'passed' ? 'Geçti' : 'Kaldı'}
                               </span>
                             </div>
                           ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* VIEW: Memorization Report */}
                  {academicView === 'memorization' && (
                    <div className="space-y-2">
                      {SURAH_LIST.map(surah => {
                        const status = selectedStudentForDetail.memorization[surah.id] || 'none';
                        return (
                          <div key={surah.id} className={`flex items-center justify-between p-3 rounded-xl border ${status === 'passed' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100'}`}>
                            <div className="flex items-center gap-3">
                               <span className="text-xs font-bold text-gray-400 w-8">{surah.number}.</span>
                               <span className={`text-sm font-bold ${status === 'passed' ? 'text-emerald-700' : 'text-gray-700'}`}>{surah.title}</span>
                            </div>
                            <div className="flex gap-1">
                               <button 
                                 onClick={() => handleMemorizationChange(selectedStudentForDetail.id, surah.id, status === 'passed' ? 'none' : 'passed')}
                                 className={`p-2 rounded-lg transition ${status === 'passed' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-300 hover:bg-emerald-100 hover:text-emerald-400'}`}
                               >
                                 <FaCheck size={12} />
                               </button>
                               <button 
                                 onClick={() => handleMemorizationChange(selectedStudentForDetail.id, surah.id, status === 'repeat' ? 'none' : 'repeat')}
                                 className={`p-2 rounded-lg transition ${status === 'repeat' ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-300 hover:bg-amber-100 hover:text-amber-400'}`}
                               >
                                 <FaMicrophone size={12} />
                               </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
              
              {/* TAB: SPIRITUAL DETAIL (PRAYER GRID) */}
              {detailTab === 'spiritual_detail' && activeTab === 'karne' && (
                <div className="space-y-6">
                   <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center">
                     <p className="text-emerald-800 text-xs font-bold uppercase mb-2">Haftalık Namaz Özeti</p>
                     <div className="flex justify-center gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Cemaat</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-400"></span> Tek</span>
                        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-200"></span> Kılınmadı</span>
                     </div>
                   </div>

                   <div className="overflow-x-auto">
                     <table className="w-full text-xs">
                        <thead>
                           <tr>
                              <th className="p-2 text-left text-gray-400 font-bold">Tarih</th>
                              {PRAYER_TIMES.map(p => <th key={p.id} className="p-2 text-center text-gray-500">{p.label}</th>)}
                           </tr>
                        </thead>
                        <tbody>
                           {getLast7Days().map(date => (
                             <tr key={date} className="border-t border-gray-100">
                                <td className="p-3 font-bold text-gray-600">{date.split('-').slice(1).reverse().join('.')}</td>
                                {PRAYER_TIMES.map(p => {
                                   const status = selectedStudentForDetail.prayers[`${date}-${p.id}`];
                                   return (
                                     <td key={p.id} className="p-2 text-center">
                                        {status ? (
                                           <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-white ${status.type === 'cemaat' ? 'bg-emerald-500' : 'bg-blue-400'}`}>
                                              {status.type === 'cemaat' ? <FaUsers size={10} /> : <FaUser size={10} />}
                                           </div>
                                        ) : (
                                          <div className="w-2 h-2 rounded-full bg-gray-200 mx-auto"></div>
                                        )}
                                     </td>
                                   )
                                })}
                             </tr>
                           ))}
                        </tbody>
                     </table>
                   </div>
                </div>
              )}

              {/* TAB: BADGES */}
              {detailTab === 'badges' && activeTab === 'karne' && (
                 <div className="space-y-4">
                    <h4 className="font-bold text-gray-800 text-sm">Kazanılan Rozetler</h4>
                    <div className="flex flex-wrap gap-2">
                       {selectedStudentForDetail.badges.map(bId => {
                         const badge = badges.find(b => b.id === bId);
                         return badge ? (
                           <div key={bId} className="bg-slate-800 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                             {badge.icon} {badge.title}
                             <button onClick={() => removeBadgeFromStudent(bId)} className="bg-white/20 rounded-full w-4 h-4 flex items-center justify-center hover:bg-red-500 transition"><FaTimes size={8} /></button>
                           </div>
                         ) : null
                       })}
                       {selectedStudentForDetail.badges.length === 0 && <span className="text-xs text-gray-400 italic">Henüz rozet kazanmamış.</span>}
                    </div>

                    <h4 className="font-bold text-gray-800 text-sm mt-6">Rozet Ver</h4>
                    <div className="space-y-2">
                       {badges.map(badge => (
                         <div key={badge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                           <div className="flex items-center gap-2">
                             <span className="text-xl">{badge.icon}</span>
                             <div>
                               <div className="font-bold text-xs text-gray-800">{badge.title}</div>
                               <div className="text-[10px] text-gray-400">{badge.value} {badge.currency}</div>
                             </div>
                           </div>
                           {selectedStudentForDetail.badges.includes(badge.id) ? (
                             <span className="text-emerald-500 text-xs font-bold flex items-center gap-1"><FaCheck /> Verildi</span>
                           ) : (
                             <button onClick={() => giveBadgeToStudent(badge.id)} className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md hover:bg-purple-700 transition">Ver</button>
                           )}
                         </div>
                       ))}
                    </div>
                 </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {studentToEdit && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-lg text-gray-800">Kaşif Düzenle</h3>
                    <button onClick={() => setStudentToEdit(null)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><FaTimes /></button>
                 </div>
                 
                 <div className="space-y-3 h-[60vh] overflow-y-auto pr-2">
                    <label className="text-xs font-bold text-gray-400">Ad Soyad</label>
                    <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm" />
                    
                    <label className="text-xs font-bold text-gray-400">Kullanıcı Adı</label>
                    <input type="text" value={editFormData.username} onChange={e => setEditFormData({...editFormData, username: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm" />
                    
                    <label className="text-xs font-bold text-gray-400">Şifre</label>
                    <input type="text" value={editFormData.password} onChange={e => setEditFormData({...editFormData, password: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm" />
                    
                    <div className="border-t border-gray-100 my-2 pt-2">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Detay Bilgiler</p>
                        <input type="text" placeholder="Veli Telefon" value={editFormData.parentPhone} onChange={e => setEditFormData({...editFormData, parentPhone: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm mb-2" />
                        <input type="text" placeholder="Kaşif Telefon" value={editFormData.studentPhone} onChange={e => setEditFormData({...editFormData, studentPhone: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm mb-2" />
                        <input type="text" placeholder="Okul" value={editFormData.school} onChange={e => setEditFormData({...editFormData, school: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm mb-2" />
                        <input type="text" placeholder="Adres" value={editFormData.address} onChange={e => setEditFormData({...editFormData, address: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-3 mt-4">
                     <button onClick={deleteStudent} className="w-full bg-red-100 text-red-600 py-4 rounded-xl font-black shadow-sm hover:bg-red-200 flex items-center justify-center gap-2"><FaTrash /> Sil</button>
                     <button onClick={saveStudentEdit} className="w-full bg-blue-500 text-white py-4 rounded-xl font-black shadow-lg hover:bg-blue-600 flex items-center justify-center gap-2"><FaSave /> Kaydet</button>
                 </div>
             </div>
          </div>
      )}

      {/* REGISTER MODAL */}
      {showRegisterModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
             <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-lg text-gray-800">Panelden Kaşif Kaydı</h3>
                    <button onClick={() => setShowRegisterModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><FaTimes /></button>
                 </div>
                 
                 <div className="space-y-3 h-[60vh] overflow-y-auto pr-2">
                    <input type="text" placeholder="Ad Soyad *" value={newStudentData.fullName} onChange={e => setNewStudentData({...newStudentData, fullName: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm" />
                    <input type="text" placeholder="Kullanıcı Adı *" value={newStudentData.username} onChange={e => setNewStudentData({...newStudentData, username: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm" />
                    <input type="text" placeholder="Şifre *" value={newStudentData.password} onChange={e => setNewStudentData({...newStudentData, password: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm" />
                    <select value={newStudentData.classCode} onChange={e => setNewStudentData({...newStudentData, classCode: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm font-bold">
                        <option value="">Grup Seçin *</option>
                        {instructor.classCodes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="border-t border-gray-100 my-2 pt-2">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">Detay Bilgiler</p>
                        <input type="text" placeholder="Veli Telefon" value={newStudentData.parentPhone} onChange={e => setNewStudentData({...newStudentData, parentPhone: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm mb-2" />
                        <input type="text" placeholder="Kaşif Telefon" value={newStudentData.studentPhone} onChange={e => setNewStudentData({...newStudentData, studentPhone: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm mb-2" />
                        <input type="text" placeholder="Okul" value={newStudentData.school} onChange={e => setNewStudentData({...newStudentData, school: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm mb-2" />
                        <input type="text" placeholder="Adres" value={newStudentData.address} onChange={e => setNewStudentData({...newStudentData, address: e.target.value})} className="w-full bg-gray-50 p-3 rounded-xl border border-gray-100 outline-none text-sm" />
                    </div>
                 </div>

                 <button onClick={handleManualRegister} className="w-full bg-emerald-500 text-white py-4 rounded-xl font-black mt-4 shadow-lg hover:bg-emerald-600">Kaşifi Kaydet</button>
             </div>
          </div>
      )}

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2 pb-6 px-6 flex justify-around items-center z-50">
        <NavButton active={activeTab === 'academic'} onClick={() => setActiveTab('academic')} icon={<FaBookOpen />} label="Ders" />
        <NavButton active={activeTab === 'karne'} onClick={() => setActiveTab('karne')} icon={<FaUser />} label="Karne" />
        <NavButton active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} icon={<FaUsers />} label="Gruplar" />
        <NavButton active={activeTab === 'management'} onClick={() => setActiveTab('management')} icon={<FaTasks />} label="Yönetim" />
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
