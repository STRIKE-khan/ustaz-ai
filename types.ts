export interface Student {
  id: string;
  rollNo: string;
  name: string;
  fatherName: string;
}

export interface ClassGroup {
  id: string;
  name: string;
  students: Student[];
}

export enum AttendanceStatus {
  PRESENT = 'Present',
  ABSENT = 'Absent',
  LEAVE = 'Leave',
}

export interface TestRecord {
  id: string;
  classId: string;
  subject: string;
  totalMarks: number;
  date: string;
  results: {
    studentId: string;
    marksObtained: number;
    status: AttendanceStatus; // To track if they were absent during test
  }[];
}

export interface ExamRecord {
  id: string;
  classId: string;
  examName: string; // e.g., "Final Term"
  subjects: {
    name: string;
    totalMarks: number;
  }[];
  results: {
    studentId: string;
    subjectMarks: { [subjectName: string]: number }; // Map subject name to marks
  }[];
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  date: string;
  records: {
    studentId: string;
    status: AttendanceStatus;
  }[];
}

export type NoticeType = 'holiday' | 'announcement' | 'important' | 'event';

export interface Notice {
  id: string;
  title: string;
  description: string;
  type: NoticeType;
  date: string;
  expiryDate?: string;
  createdAt: string;
}

export interface Homework {
  id: string;
  classId: string;
  subject: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  createdAt: string;
}

export type AppView = 'LOGIN' | 'DASHBOARD' | 'ADD_CLASS' | 'CREATE_TEST' | 'PAPER_RESULT' | 'ATTENDANCE' | 'NOTICES' | 'HOMEWORK';