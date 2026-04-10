// CORE SUBJECTS (Compulsory)
export const CORE_SUBJECTS = [
  { id: "english", name: "English", icon: "📖", color: "primary" },
  { id: "kiswahili", name: "Kiswahili", icon: "🗣️", color: "secondary" },
  { id: "mathematics", name: "Mathematics", icon: "📐", color: "accent" },
  { id: "pe", name: "Physical Education", icon: "🏃", color: "warning" },
  { id: "csl", name: "Community Service", icon: "🤝", color: "success" },
  { id: "ict", name: "Digital Literacy / ICT", icon: "💻", color: "primary" },
] as const;

// SPORTS SCIENCE PATHWAY
export const SPORTS_SUBJECTS = [
  { id: "sports-science", name: "Sports Science", icon: "🏅", color: "warning" },
  { id: "pe-advanced", name: "PE (Advanced)", icon: "🏋️", color: "accent" },
  { id: "health-fitness", name: "Health & Fitness", icon: "❤️", color: "destructive" },
  { id: "anatomy", name: "Anatomy & Movement", icon: "🦴", color: "secondary" },
  { id: "sports-mgmt", name: "Sports Management", icon: "📋", color: "primary" },
] as const;

// ARTS PATHWAY
export const ARTS_SUBJECTS = [
  { id: "fine-art", name: "Fine Art", icon: "🎨", color: "accent" },
  { id: "music", name: "Music", icon: "🎵", color: "primary" },
  { id: "theatre-film", name: "Theatre & Film", icon: "🎭", color: "secondary" },
  { id: "dance", name: "Dance", icon: "💃", color: "warning" },
  { id: "creative-writing", name: "Creative Writing", icon: "✍️", color: "success" },
] as const;

// ELECTIVE SUBJECTS
export const ELECTIVE_SUBJECTS = [
  { id: "history", name: "History & Citizenship", icon: "🏛️", color: "warning" },
  { id: "geography", name: "Geography", icon: "🌍", color: "success" },
  { id: "business", name: "Business Studies", icon: "💼", color: "primary" },
  { id: "religious-ed", name: "Religious Education", icon: "📿", color: "secondary" },
] as const;

// Combined for backward compat
export const SUBJECTS = [...CORE_SUBJECTS, ...SPORTS_SUBJECTS, ...ARTS_SUBJECTS, ...ELECTIVE_SUBJECTS] as const;

export const GRADES = Array.from({ length: 10 }, (_, i) => i + 1);

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Exam {
  id: string;
  grade: number;
  subject: string;
  title: string;
  questions: Question[];
  timeLimit: number; // seconds
}

export interface ExamResult {
  examId: string;
  score: number;
  total: number;
  percentage: number;
  dateTaken: string;
  answers: number[];
  subject: string;
  grade: number;
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  totalScore: number;
  rankPoints: number;
  profileImage?: string;
  badge?: "gold" | "silver" | "bronze";
  examsCompleted: number;
  accuracy: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  flagged: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  gradeLevel?: number;
  subject?: string;
  icon: string;
  memberCount: number;
}

export const MOCK_EXAM: Exam = {
  id: "exam-1",
  grade: 7,
  subject: "math",
  title: "Math Quiz - Fractions & Decimals",
  timeLimit: 600,
  questions: [
    { id: "q1", question: "What is 1/2 + 1/4?", options: ["1/2", "3/4", "1/3", "2/3"], correctAnswer: 1, explanation: "1/2 = 2/4, so 2/4 + 1/4 = 3/4." },
    { id: "q2", question: "Convert 0.75 to a fraction.", options: ["3/5", "7/10", "3/4", "4/5"], correctAnswer: 2, explanation: "0.75 = 75/100 = 3/4." },
    { id: "q3", question: "What is 3/5 × 10?", options: ["5", "6", "7", "8"], correctAnswer: 1, explanation: "3/5 × 10 = 30/5 = 6." },
    { id: "q4", question: "Which is greater: 2/3 or 3/5?", options: ["2/3", "3/5", "Equal", "Cannot tell"], correctAnswer: 0, explanation: "2/3 ≈ 0.667 and 3/5 = 0.6, so 2/3 is greater." },
    { id: "q5", question: "What is 7/8 - 1/4?", options: ["5/8", "3/4", "1/2", "6/8"], correctAnswer: 0, explanation: "1/4 = 2/8, so 7/8 - 2/8 = 5/8." },
  ],
};

export const MOCK_LEADERBOARD: Student[] = [
  { id: "s1", name: "Amara Osei", grade: 7, totalScore: 2850, rankPoints: 950, badge: "gold", examsCompleted: 32, accuracy: 94 },
  { id: "s2", name: "Kwame Mensah", grade: 8, totalScore: 2720, rankPoints: 910, badge: "gold", examsCompleted: 30, accuracy: 91 },
  { id: "s3", name: "Fatima Diallo", grade: 7, totalScore: 2680, rankPoints: 890, badge: "silver", examsCompleted: 28, accuracy: 89 },
  { id: "s4", name: "Emeka Obi", grade: 9, totalScore: 2550, rankPoints: 850, badge: "silver", examsCompleted: 27, accuracy: 87 },
  { id: "s5", name: "Zara Ahmed", grade: 6, totalScore: 2400, rankPoints: 800, badge: "silver", examsCompleted: 25, accuracy: 85 },
  { id: "s6", name: "David Asante", grade: 10, totalScore: 2350, rankPoints: 780, examsCompleted: 24, accuracy: 83 },
  { id: "s7", name: "Grace Mwangi", grade: 7, totalScore: 2200, rankPoints: 730, examsCompleted: 22, accuracy: 80 },
  { id: "s8", name: "Samuel Kofi", grade: 5, totalScore: 2100, rankPoints: 700, examsCompleted: 21, accuracy: 78 },
  { id: "s9", name: "Nia Johnson", grade: 8, totalScore: 1950, rankPoints: 650, examsCompleted: 20, accuracy: 75 },
  { id: "s10", name: "Ibrahim Sow", grade: 9, totalScore: 1800, rankPoints: 600, examsCompleted: 18, accuracy: 72 },
];

export const MOCK_CHAT_ROOMS: ChatRoom[] = [
  { id: "r1", name: "General Help", icon: "💬", memberCount: 245 },
  { id: "r2", name: "Grade 7 Chat", gradeLevel: 7, icon: "🎓", memberCount: 89 },
  { id: "r3", name: "Math Room", subject: "math", icon: "📐", memberCount: 156 },
  { id: "r4", name: "Science Room", subject: "science", icon: "🔬", memberCount: 112 },
  { id: "r5", name: "English Room", subject: "english", icon: "📖", memberCount: 98 },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  { id: "m1", userId: "s1", userName: "Amara", text: "Can someone help with fractions?", timestamp: "2 min ago", flagged: false },
  { id: "m2", userId: "s3", userName: "Fatima", text: "Sure! What do you need help with?", timestamp: "1 min ago", flagged: false },
  { id: "m3", userId: "s2", userName: "Kwame", text: "I found a great trick for dividing fractions - just flip and multiply! 😊", timestamp: "30s ago", flagged: false },
];

export const CURRENT_USER: Student = {
  id: "current",
  name: "Alex Student",
  grade: 7,
  totalScore: 1250,
  rankPoints: 420,
  examsCompleted: 12,
  accuracy: 78,
};

export const MOCK_RESULTS: ExamResult[] = [
  { examId: "e1", score: 4, total: 5, percentage: 80, dateTaken: "2026-04-09", answers: [1, 2, 1, 0, 0], subject: "mathematics", grade: 7 },
  { examId: "e2", score: 3, total: 5, percentage: 60, dateTaken: "2026-04-07", answers: [0, 1, 2, 1, 3], subject: "english", grade: 7 },
  { examId: "e3", score: 5, total: 5, percentage: 100, dateTaken: "2026-04-05", answers: [1, 0, 2, 3, 1], subject: "kiswahili", grade: 7 },
];
