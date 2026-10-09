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
  riskScore: number;
  notes: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  auditLog?: AuditEntry[];
}

export interface RecordsApiResponse {
  success: boolean;
  totalCount: number;
  data: VerificationRecord[];
  appliedDelayMs: number;
  userRoleFilter: string;
}
