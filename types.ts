
export type UserRole = 'instructor' | 'student' | 'admin' | null;

export interface PrayerStatus {
  type: 'tek' | 'cemaat' | 'none';
  timestamp: number;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  description: string;
  currency: 'GP' | 'NP';
  value: number;
}

export interface WeeklyTask {
  id: number;
  title: string;
  reward: number;
  currency: 'GP' | 'NP';
  target: number; 
}

export interface Announcement {
  id: number;
  title: string;
  message: string;
  date: string;
  classCode: string;
}

export interface AppEvent {
  id: number;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  classCode: string; // 'GLOBAL' for admin events, specific code for instructors
  createdBy: 'admin' | 'instructor';
}

export interface WeeklyReport {
  id: number;
  instructorId: number;
  instructorName: string;
  reportDate: string; // Date of submission
  isHeld: boolean;
  attendeeCount: number;
  location: string;
  notes: string;
}

export interface PendingItem {
  id: string; // unique transaction id
  itemId: string;
  itemTitle: string;
  price: number;
  currency: 'GP' | 'NP';
  timestamp: number;
}

export interface Student {
  id: number;
  name: string;
  username: string;
  password: string;
  group: string; 
  status: 'approved' | 'pending'; 
  classCode: string; 
  // New Fields
  parentPhone?: string;
  studentPhone?: string;
  address?: string;
  school?: string;
  
  points: number;       
  namazPoints: number;  
  inventory: string[];
  pendingItems: PendingItem[]; // Market items waiting for instructor approval
  badges: string[];     
  completedTasks: number[]; 
  pendingTasks: number[]; // Tasks waiting for instructor approval
  attendance: Record<string, 'present' | 'absent' | 'none'>; 
  reading: Record<string, 'passed' | 'study' | 'failed' | 'none'>; 
  readingAssignment?: string; 
  memorization: Record<string, 'passed' | 'repeat' | 'none'>; 
  prayers: Record<string, PrayerStatus>; 
}

export interface Instructor {
  id: number;
  name: string;
  username: string;
  password: string;
  classCodes: string[];
}

export interface MarketItem {
  id: string;
  title: string;
  price: number;
  currency: 'GP' | 'NP';
  icon: string;
  description: string;
  stock: number; // Stock tracking
  classCode: string; // Hangi gruba ait olduğu
}

export interface Surah {
  id: string;
  title: string;
  number: number;
  audioStartTime?: number; // Ses dosyasının başlayacağı saniye (Yasin sayfaları için)
}
