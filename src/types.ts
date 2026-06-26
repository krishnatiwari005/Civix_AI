export type UserRole = 'citizen' | 'authority' | 'admin';
export type IssueCategory = 'Roads' | 'Water' | 'Electricity' | 'Waste' | 'Public Safety';
export type IssueSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IssueStatus = 'Reported' | 'Verified' | 'Assigned' | 'In Progress' | 'Resolved';

export interface User {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  badge: 'Civic Helper' | 'City Guardian' | 'Community Hero';
  ward: string;
  createdAt: string;
  photoURL?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
  isOfficial: boolean;
}

export interface AIAnalysis {
  issue: string;
  category: IssueCategory;
  severity: IssueSeverity;
  severityScore: number;
  confidence: number;
  description: string;
  urgency: 'Immediate' | 'Soon' | 'Scheduled';
  estimatedRepairTime: string;
  riskFactors: string[];
  suggestedTitle: string;
  rawResponse?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  severity: IssueSeverity;
  severityScore: number;
  status: IssueStatus;
  imageUrl?: string;
  latitude: number;
  longitude: number;
  address: string;
  ward: string;
  landmark: string;
  department: string;
  reportedBy: string;
  reporterName: string;
  verifications: { yes: number; no: number };
  verifiedBy: string[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  aiAnalysis?: AIAnalysis;
  escalationLevel: number; // 0, 1, 2
  duplicateOf?: string | null;
  comments: Comment[];
}

export interface Verification {
  id: string;
  issueId: string;
  userId: string;
  vote: 'yes' | 'no';
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'new_issue' | 'status_update' | 'verification_request' | 'escalation';
  read: boolean;
  createdAt: string;
  issueId: string;
}

export interface Department {
  id: string;
  name: string;
  category: IssueCategory;
  head: string;
  contact: string;
  totalAssigned: number;
  totalResolved: number;
}

export interface PredictiveAlert {
  zone: string;
  category: IssueCategory;
  riskLevel: 'High' | 'Medium' | 'Low';
  likelihood: string;
  recommendation: string;
  timeframe: string;
}

export interface PredictiveAnalysisResult {
  predictions: PredictiveAlert[];
  summary: string;
}
