export type Concern = {
  id: string;
  title: string;
  description: string;
  authorName: string;
  apartmentNumber: string;
  upvotes: number;
  upvotedBy: string[]; // Array of apartmentNumbers that have upvoted
  createdAt: string; // ISO 8601 date string
  deletedAt?: string; // ISO 8601 date string for soft delete
  deletedBy?: string; // User ID who deleted the concern
  isDeleted?: boolean; // Soft delete flag
};

export type User = {
  name: string;
  apartmentNumber: string;
};

export type UserRole = 'admin' | 'owner' | 'tenant';

export type Profile = {
  uid?: string;
  fullName: string;
  tower: string;
  apartmentNumber: string;
  phone: string;
  verified: boolean;
  role?: UserRole;
  assignedBy?: string;
  assignedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};
