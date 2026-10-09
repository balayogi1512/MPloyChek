export type UserRole = 'Admin' | 'General User';

export interface User {
  id: string;
  userId: string;
  username?: string;
  password: string;
  name: string;
  role: UserRole;
  department: string;
  email: string;
  createdAt: string;
}

export type RecordStatus = 'Verified' | 'Pending Review' | 'Flagged';
export type AccessLevel = 'General' | 'Admin';

export interface AuditEntry {
  timestamp: string;
  editorName: string;
  action: string;
  previousStatus?: string;
  newStatus?: string;
  notes?: string;
}

export interface VerificationRecord {
  id: string;
  candidateName: string;
  position: string;
  checkType: string;
  status: RecordStatus;
  accessLevel: AccessLevel;
  submittedDate: string;
  verifiedBy: string;
  riskScore: number; // 0 - 100
  notes: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  auditLog?: AuditEntry[];
}

export interface LoginRequest {
  userId: string;
  password: string;
  role: UserRole;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password'>;
  token?: string;
}
