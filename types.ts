export enum Role {
  ALUNO = 'ALUNO',
  PROGRAMADOR = 'PROGRAMADOR',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  password?: string; // Should not be sent to frontend in real app
  isCTStudent?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  content: string; // Could be markdown, video URL, etc.
  videoUrl?: string; // Optional: for embedding videos
  attachments?: { name: string; url: string }[]; // Added for file attachments
}

export interface Module {
  id:string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  modules: Module[];
}

export interface Enrollment {
  userId: string;
  courseId: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  expiresAt: string; // ISO Date String
  isActive: boolean;
  courseId?: string; // If undefined, applies to all courses
}

export interface Note {
  id: string;
  title: string;
  content: string;
  lastSaved: string; // ISO Date String
}

export interface Folder {
  id: string;
  name: string;
  notes: Note[];
}

export interface CTAccessCode {
  id: string;
  code: string;
  isUsed: boolean;
  usedByUserId?: string;
}

export interface CTAccessCodeWithUserName extends CTAccessCode {
  usedByUserName?: string;
}