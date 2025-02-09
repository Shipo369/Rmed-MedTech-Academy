export interface User {
  id: string;
  username: string;
  password: string;
  permissions: {
    trainings: {
      id: string;
      validFrom: string;
      validUntil: string;
      deviceTypes: string[];
    }[];
  };
}

export interface DocumentDownload {
  id: string;
  userId: string;
  username: string;
  documentId: string;
  downloadDate: string;
}

export interface DeviceDocument {
  id: string;
  deviceId: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  version: string;
  downloads: DocumentDownload[];
  fileUrl?: string; // URL für den Download
}

export interface Question {
  id: string;
  text: string;
  type: 'single' | 'multiple';
  options: string[];
  correctAnswers: number[];
}

export interface DeviceType {
  id: string;
  trainingId: string;
  title: string;
  description: string;
  imageUrl: string;
  imageScale: number;
  questions: Question[];
  passingPercentage: number;
  documentation?: DeviceDocument;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageScale: number;
  deviceTypes: DeviceType[];
}

export interface TestAnswer {
  questionId: string;
  selectedAnswers: number[];
}

export interface TestResult {
  id: string;
  userId: string;
  username: string;
  deviceId: string;
  deviceTitle: string;
  score: number;
  passed: boolean;
  timestamp: string;
  isLocked: boolean;
}