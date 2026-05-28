export type UserRole = 'admin' | 'guru_bk' | 'wali_kelas' | 'siswa';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  kelasId: string; // e.g. "VII_A"
  pointSopan: number;
  pointBersih: number;
  badges: string[]; // ['sopan_santun', 'kelas_bersih', 'peduli_teman', 'disiplin']
  bio: string;
  apresiasiDiterima: number;
  avatarEmoji?: string;
  avatarColor?: string;
  avatarImage?: string;
}

export interface Class {
  id: string;
  name: string;
  waliKelasName: string;
  pointKebersihan: number;
  pointPerilaku: number;
}

export interface Log {
  id: string;
  studentId: string;
  studentName: string;
  kelasId: string;
  type: 'sopan' | 'bersih' | 'apresiasi' | 'etika';
  points: number;
  description: string;
  date: string;
  giverName: string;
  isVerified: boolean;
}

export interface EthicGuide {
  id: string;
  title: string;
  category: 'Sopan' | 'Disiplin' | 'Etika' | 'Anti-Bullying';
  description: string;
  tips: string[];
}

export interface Reward {
  id: string;
  title: string;
  pointsCost: number;
  description: string;
  type: 'siswa' | 'kelas';
  stock: number;
}

export interface DailyReminder {
  id: string;
  title: string;
  text: string;
  author: string;
  date: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  pointsReward: number;
}
