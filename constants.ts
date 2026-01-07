
import { Badge, MarketItem, Student, Surah, WeeklyTask, Announcement, Instructor } from './types';

// YENİ SIRALAMA: Kısa Sureler -> Fatiha -> Orta Sureler
export const SURAH_LIST: Surah[] = [
  // Kısa Sureler (Nas -> Duha) - En üstte kalması istendi
  { id: 'nas', title: 'Nas Suresi', number: 114 },
  { id: 'felak', title: 'Felak Suresi', number: 113 },
  { id: 'ihlas', title: 'İhlas Suresi', number: 112 },
  { id: 'tebbet', title: 'Tebbet Suresi', number: 111 },
  { id: 'nasr', title: 'Nasr Suresi', number: 110 },
  { id: 'kafirun', title: 'Kafirun Suresi', number: 109 },
  { id: 'kevser', title: 'Kevser Suresi', number: 108 },
  { id: 'maun', title: 'Maun Suresi', number: 107 },
  { id: 'kureys', title: 'Kureyş Suresi', number: 106 },
  { id: 'fil', title: 'Fil Suresi', number: 105 },
  { id: 'humeze', title: 'Hümeze Suresi', number: 104 },
  { id: 'asr', title: 'Asr Suresi', number: 103 },
  { id: 'tekasur', title: 'Tekasür Suresi', number: 102 },
  { id: 'karia', title: 'Karia Suresi', number: 101 },
  { id: 'adiyat', title: 'Adiyat Suresi', number: 100 },
  { id: 'zilzal', title: 'Zilzal Suresi', number: 99 },
  { id: 'beyyine', title: 'Beyyine Suresi', number: 98 },
  { id: 'kadir', title: 'Kadir Suresi', number: 97 },
  { id: 'alak', title: 'Alak Suresi', number: 96 },
  { id: 'tin', title: 'Tin Suresi', number: 95 },
  { id: 'insirah', title: 'İnşirah Suresi', number: 94 },
  { id: 'duha', title: 'Duha Suresi', number: 93 },

  // Fatiha
  { id: 'fatiha', title: 'Fatiha Suresi', number: 1 },

  // Orta Sureler
  { id: 'mulk', title: 'Mülk (Tebareke)', number: 67 },
  { id: 'nebe', title: 'Nebe (Amme)', number: 78 },
  { id: 'buruc', title: 'Buruc Suresi', number: 85 },
  { id: 'tarik', title: 'Tarık Suresi', number: 86 },
  { id: 'leyl', title: 'Leyl Suresi', number: 92 },
];

export const INITIAL_MARKET_ITEMS: MarketItem[] = [
  { id: 'kantin_cek', title: '50TL Kantin Çeki', price: 500, currency: 'GP', icon: '🍔', description: 'Okul kantininde geçerli.', stock: 10 },
  { id: 'ozel_izin', title: 'Serbest Kıyafet Günü', price: 1000, currency: 'NP', icon: '👕', description: 'Bir gün serbest kıyafet hakkı.', stock: 5 },
  { id: 'mac_bileti', title: 'Halı Saha Maçı', price: 750, currency: 'GP', icon: '⚽', description: 'Arkadaşlarla maç organizasyonu.', stock: 20 },
  { id: 'kitap', title: 'D&R Hediye Kartı', price: 1500, currency: 'NP', icon: '📚', description: 'İstediğin bir kitap için.', stock: 3 },
];

export const AVAILABLE_BADGES: Badge[] = [
  { id: 'namaz_kurtu', title: 'İstikrar Abidesi', icon: '🕌', description: '5 Vakit namazını eksiksiz kılanlar.', currency: 'NP', value: 100 },
  { id: 'hafiz_adayi', title: 'Hafız Adayı', icon: '📖', description: 'Ezberlerini en hızlı tamamlayan.', currency: 'GP', value: 150 },
  { id: 'sabah_yildizi', title: 'Sabah Yıldızı', icon: '✨', description: 'Sabah namazı buluşmalarına katılan.', currency: 'NP', value: 50 },
  { id: 'cemaat_lideri', title: 'Safın Öncüsü', icon: '🤲', description: 'Sürekli cemaatle kılanlar.', currency: 'NP', value: 75 },
];

export const INITIAL_TASKS: WeeklyTask[] = [
  { id: 1, title: 'Cuma Namazına Katılım', reward: 150, currency: 'NP', target: 1 },
  { id: 2, title: 'Yasin Suresi Okuması', reward: 200, currency: 'GP', target: 1 },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: 1, title: 'Dönem Başlangıcı', message: 'Yeni eğitim döneminde başarılar dileriz.', date: '01.09.2024', classCode: '1453' }
];

export const INITIAL_INSTRUCTORS: Instructor[] = [
  { id: 1, name: 'Mehmet Abisi', username: 'mehmet', password: '123', classCodes: ['1453'] },
  // TEST HESABI
  { id: 999, name: 'Test Eğitmen', username: '1', password: '1', classCodes: ['TEST'] }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 101,
    name: 'Ahmet Yılmaz',
    username: 'ahmet',
    password: '123',
    group: 'Yıldızlar',
    status: 'approved',
    classCode: '1453',
    parentPhone: '0555 111 22 33',
    studentPhone: '0555 444 55 66',
    address: 'Sultangazi Merkez Mah.',
    school: 'İmam Hatip Ortaokulu',
    points: 1250,
    namazPoints: 450,
    inventory: [],
    pendingItems: [],
    badges: ['namaz_kurtu'],
    completedTasks: [],
    pendingTasks: [],
    attendance: {},
    reading: {},
    memorization: {},
    prayers: {}
  },
  // TEST HESABI
  {
    id: 999,
    name: 'Test Kaşif',
    username: '1',
    password: '1',
    group: 'Test Grubu',
    status: 'approved',
    classCode: 'TEST',
    parentPhone: '0500 000 00 00',
    studentPhone: '',
    address: 'Test Adresi',
    school: 'Test Okulu',
    points: 500,
    namazPoints: 200,
    inventory: [],
    pendingItems: [],
    badges: [],
    completedTasks: [],
    pendingTasks: [],
    attendance: {},
    reading: {},
    memorization: {},
    prayers: {}
  }
];

export const PRAYER_TIMES = [
  { id: 'sabah', label: 'Sabah', icon: '🌅', hour: 5 },
  { id: 'ogle', label: 'Öğle', icon: '☀️', hour: 13 },
  { id: 'ikindi', label: 'İkindi', icon: '🌤️', hour: 16 },
  { id: 'aksam', label: 'Akşam', icon: '🌆', hour: 19 },
  { id: 'yatsi', label: 'Yatsı', icon: '🌙', hour: 21 },
];
