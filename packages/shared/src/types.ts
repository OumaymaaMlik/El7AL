export enum UserRole {
  CLIENT = 'CLIENT',
  PROVIDER = 'PROVIDER',
  ADMIN = 'ADMIN',
}

export enum AccountStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED_LOW_BALANCE = 'SUSPENDED_LOW_BALANCE',
  BLOCKED = 'BLOCKED',
  REJECTED = 'REJECTED',
}

export enum MissionStatus {
  CREATED = 'CREATED',
  BROADCASTED = 'BROADCASTED',
  ACCEPTED = 'ACCEPTED',
  EN_ROUTE = 'EN_ROUTE',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  DUAL_CONFIRM = 'DUAL_CONFIRM',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  email?: string | null;
  fullName: string;
  role: UserRole;
  status: AccountStatus;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface ProviderDetails {
  id: string;
  userId: string;
  bio?: string | null;
  radiusKm: number;
  isAvailable: boolean;
  currentLat?: number | null;
  currentLng?: number | null;
  walletBalance: number;
  ratingAverage: number;
  totalRatings: number;
  documentsUrl: string[];
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description?: string | null;
  isActive: boolean;
}

export interface MissionData {
  id: string;
  clientId: string;
  providerId?: string | null;
  categoryId: string;
  status: MissionStatus;
  pickupLat: number;
  pickupLng: number;
  addressText: string;
  description?: string | null;
  commissionFee: number;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
}
