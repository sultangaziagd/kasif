
import React, { useState, useEffect } from 'react';
import { UserRole, Student, MarketItem, WeeklyTask, Announcement, Badge, Instructor, AppEvent, WeeklyReport } from './types';
import { INITIAL_STUDENTS, INITIAL_INSTRUCTORS, INITIAL_MARKET_ITEMS, INITIAL_TASKS, INITIAL_ANNOUNCEMENTS, AVAILABLE_BADGES } from './constants';
import LoginScreen from './components/LoginScreen';
import InstructorDashboard from './components/InstructorDashboard';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';

// Firebase Imports
import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';

export default function App() {
  const [role, setRole] = useState<UserRole>(null);
  const [currentUser, setCurrentUser] = useState<Student | Instructor | any>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [students, setStudents] = useState<Student[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [reports, setReports] = useState<WeeklyReport[]>([]);

  // --- FIREBASE LISTENERS & AUTO SEEDING ---
  
  // Helper to seed data if collection is empty
  const seedCollection = async (collectionName: string, data: any[]) => {
    try {
      const batch = writeBatch(db);
      data.forEach(item => {
        const ref = doc(db, collectionName, item.id.toString());
        batch.set(ref, item);
      });
      await batch.commit();
      console.log(`${collectionName} veritabanına yüklendi.`);
    } catch (error) {
      console.error(`Error seeding ${collectionName}:`, error);
    }
  };

  useEffect(() => {
    // 1. Students Listener
    const unsubStudents = onSnapshot(collection(db, "students"), (snapshot) => {
      // Eğer snapshot boşsa hemen verileri yükle (loading kontrolünü kaldırdık)
      if (snapshot.empty) { 
        seedCollection("students", INITIAL_STUDENTS); 
      } else {
        const data = snapshot.docs.map(doc => doc.data() as Student);
        setStudents(data);
      }
    });

    // 2. Instructors Listener
    const unsubInstructors = onSnapshot(collection(db, "instructors"), (snapshot) => {
      if (snapshot.empty) {
         seedCollection("instructors", INITIAL_INSTRUCTORS);
      } else {
         const data = snapshot.docs.map(doc => doc.data() as Instructor);
         setInstructors(data);
      }
    });

    // 3. Market Items Listener
    const unsubMarket = onSnapshot(collection(db, "marketItems"), (snapshot) => {
      if (snapshot.empty) {
         seedCollection("marketItems", INITIAL_MARKET_ITEMS);
      } else {
         const data = snapshot.docs.map(doc => doc.data() as MarketItem);
         setMarketItems(data);
      }
    });

    // 4. Tasks Listener
    const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
      if (snapshot.empty) {
         seedCollection("tasks", INITIAL_TASKS);
      } else {
         const data = snapshot.docs.map(doc => doc.data() as WeeklyTask);
         setTasks(data);
      }
    });

    // 5. Announcements Listener
    const unsubAnnouncements = onSnapshot(collection(db, "announcements"), (snapshot) => {
      if (snapshot.empty) {
         seedCollection("announcements", INITIAL_ANNOUNCEMENTS);
      } else {
         const data = snapshot.docs.map(doc => doc.data() as Announcement);
         setAnnouncements(data);
      }
    });

    // 6. Badges Listener
    const unsubBadges = onSnapshot(collection(db, "badges"), (snapshot) => {
      if (snapshot.empty) {
         seedCollection("badges", AVAILABLE_BADGES);
      } else {
         const data = snapshot.docs.map(doc => doc.data() as Badge);
         setBadges(data);
      }
    });

    // 7. Events Listener (No seed needed)
    const unsubEvents = onSnapshot(collection(db, "events"), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as AppEvent);
      setEvents(data);
    });

    // 8. Reports Listener (No seed needed)
    const unsubReports = onSnapshot(collection(db, "reports"), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as WeeklyReport);
      setReports(data);
    });

    // UI'ın titremesini önlemek için kısa bir yükleme süresi
    setTimeout(() => setLoading(false), 1500);

    return () => {
      unsubStudents();
      unsubInstructors();
      unsubMarket();
      unsubTasks();
      unsubAnnouncements();
      unsubBadges();
      unsubEvents();
      unsubReports();
    };
  }, []); // Run once on mount

  // --- FIREBASE WRITE OPERATIONS ---

  const updateStudent = async (id: number, updater: (s: Student) => Student) => {
    const currentStudent = students.find(s => s.id === id);
    if (!currentStudent) return;
    const updatedStudent = updater(currentStudent);
    
    try {
      await setDoc(doc(db, "students", id.toString()), updatedStudent);
      if (role === 'student' && currentUser.id === id) {
        setCurrentUser(updatedStudent);
      }
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const updateInstructor = async (id: number, updater: (i: Instructor) => Instructor) => {
    const currentInstructor = instructors.find(i => i.id === id);
    if (!currentInstructor) return;
    const updatedInstructor = updater(currentInstructor);

    try {
      await setDoc(doc(db, "instructors", id.toString()), updatedInstructor);
      if (role === 'instructor' && currentUser.id === id) {
        setCurrentUser(updatedInstructor);
      }
    } catch (error) {
      console.error("Error updating instructor:", error);
    }
  };

  const registerStudent = async (data: any) => {
    const newStudent: Student = {
      id: Date.now(),
      name: data.fullName,
      username: data.username,
      password: data.password,
      group: 'Kaşif Grubu',
      status: 'pending',
      classCode: data.classCode,
      parentPhone: data.parentPhone || '',
      studentPhone: data.studentPhone || '',
      address: data.address || '',
      school: data.school || '',
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
    await setDoc(doc(db, "students", newStudent.id.toString()), newStudent);
  };

  const registerInstructor = async (data: any) => {
    const newInstructor: Instructor = {
      id: Date.now(),
      name: data.fullName,
      username: data.username,
      password: data.password,
      classCodes: [] 
    };
    await setDoc(doc(db, "instructors", newInstructor.id.toString()), newInstructor);
  };

  // --- WRAPPERS FOR CHILDREN COMPONENTS ---

  const setStudentsWrapper = (val: any) => {
    // If passing function, calculate new state locally to determine changes
    const newArr = typeof val === 'function' ? val(students) : val;
    syncArrayChanges(students, newArr, 'students');
  };

  const setInstructorsWrapper = (val: any) => {
     const newArr = typeof val === 'function' ? val(instructors) : val;
     syncArrayChanges(instructors, newArr, 'instructors');
  }

  const setEventsWrapper = (val: any) => {
     const newArr = typeof val === 'function' ? val(events) : val;
     syncArrayChanges(events, newArr, 'events');
  }

  const setReportsWrapper = (val: any) => {
     const newArr = typeof val === 'function' ? val(reports) : val;
     syncArrayChanges(reports, newArr, 'reports');
  }

  const setMarketItemsWrapper = (val: any) => {
     const newArr = typeof val === 'function' ? val(marketItems) : val;
     syncArrayChanges(marketItems, newArr, 'marketItems');
  }

  const setTasksWrapper = (val: any) => {
     const newArr = typeof val === 'function' ? val(tasks) : val;
     syncArrayChanges(tasks, newArr, 'tasks');
  }

  const setAnnouncementsWrapper = (val: any) => {
     const newArr = typeof val === 'function' ? val(announcements) : val;
     syncArrayChanges(announcements, newArr, 'announcements');
  }

  const setBadgesWrapper = (val: any) => {
     const newArr = typeof val === 'function' ? val(badges) : val;
     syncArrayChanges(badges, newArr, 'badges');
  }

  // Generic Sync Function: Compares old and new arrays to decide Add or Delete in Firestore
  const syncArrayChanges = async (oldArr: any[], newArr: any[], collectionName: string) => {
      // 1. Check for Deletions
      for (const oldItem of oldArr) {
          if (!newArr.find(newItem => newItem.id === oldItem.id)) {
              try {
                  await deleteDoc(doc(db, collectionName, oldItem.id.toString()));
              } catch(e) { console.error("Delete error", e); }
          }
      }
      // 2. Check for Additions or Updates
      for (const newItem of newArr) {
          try {
             await setDoc(doc(db, collectionName, newItem.id.toString()), newItem);
          } catch(e) { console.error("Update error", e); }
      }
  };

  const handleLogin = (selectedRole: UserRole, user: Student | Instructor | any) => {
    setRole(selectedRole);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setRole(null);
    setCurrentUser(null);
  };

  if (loading) return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-100 font-sans">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-bold animate-pulse">Kaşif Platformu Başlatılıyor...</p>
      </div>
  );

  if (!role) return (
    <LoginScreen 
      onLogin={handleLogin} 
      onRegisterStudent={registerStudent} 
      onRegisterInstructor={registerInstructor}
      students={students} 
      instructors={instructors}
    />
  );
  
  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      {role === 'admin' ? (
        <AdminDashboard
          instructors={instructors}
          students={students}
          events={events}
          reports={reports}
          updateInstructor={updateInstructor}
          setInstructors={setInstructorsWrapper}
          setEvents={setEventsWrapper}
          onLogout={handleLogout}
        />
      ) : role === 'instructor' ? (
        <InstructorDashboard 
          instructor={currentUser as Instructor}
          students={students.filter(s => (currentUser as Instructor).classCodes.includes(s.classCode))} 
          updateStudent={updateStudent} 
          updateInstructor={updateInstructor}
          setStudents={setStudentsWrapper}
          marketItems={marketItems}
          setMarketItems={setMarketItemsWrapper}
          tasks={tasks}
          setTasks={setTasksWrapper}
          announcements={announcements}
          setAnnouncements={setAnnouncementsWrapper}
          badges={badges}
          setBadges={setBadgesWrapper}
          events={events}
          setEvents={setEventsWrapper}
          reports={reports}
          setReports={setReportsWrapper}
          onLogout={handleLogout} 
        />
      ) : (
        <StudentDashboard 
          student={students.find(s => s.id === currentUser.id) || currentUser} 
          updateStudent={updateStudent} 
          // SADECE ÖĞRENCİNİN SINIF KODUNA AİT MARKET ÜRÜNLERİNİ GÖSTER
          marketItems={marketItems.filter(i => i.classCode === (currentUser as Student).classCode)}
          tasks={tasks}
          // DUYURULAR ZATEN FİLTRELENİYOR
          announcements={announcements.filter(a => a.classCode === (currentUser as Student).classCode)}
          badges={badges}
          // ETKİNLİKLER ZATEN FİLTRELENİYOR (GLOBAL + SINIF)
          events={events.filter(e => e.classCode === 'GLOBAL' || e.classCode === (currentUser as Student).classCode)}
          onLogout={handleLogout} 
        />
      )}
    </div>
  );
}
