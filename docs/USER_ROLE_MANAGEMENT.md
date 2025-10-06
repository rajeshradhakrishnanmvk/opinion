# User Role Management System

## Overview

This system implements a hierarchical user role system with automatic tenant assignment for new users and admin-controlled role management.

## Role Hierarchy

### 1. **Tenant** (Default)
- **Assignment**: Automatically assigned to all new users on first sign-in
- **Permissions**: 
  - Can submit concerns
  - Can view and upvote public concerns
  - Cannot upload files
  - Cannot view file management section
  - Cannot delete concerns

### 2. **Owner** 
- **Assignment**: Must be assigned by an admin
- **Permissions**:
  - All tenant permissions
  - Can upload PDF files (up to 5MB)
  - Can view file management section
  - Can download files

### 3. **Admin**
- **Assignment**: Must be manually set via Firebase Admin
- **Permissions**:
  - All owner permissions
  - Can soft delete concerns
  - Can manage user roles
  - Can promote tenants to owners or admins
  - Can access admin dashboard
  - Full file management access

## User Management Features

### Automatic Tenant Assignment
- New users are automatically assigned the "tenant" role upon first sign-in
- Default profile is created in Firestore with basic information
- Custom claims are synchronized for proper authorization

### Admin Role Management
- Admins can view all users in the User Management panel
- Role changes are applied to both Firestore profiles and Firebase custom claims
- Real-time updates without requiring users to sign out/in

### Role Synchronization
- Firestore profiles store the authoritative role information
- Firebase custom claims are kept in sync for Security Rules
- Manual sync scripts available for maintenance

## Implementation Details

### Components
- **UserManagement**: Admin interface for role management
- **AuthContext**: Handles automatic tenant profile creation
- **Profile Page**: Contains user management interface for admins

### Database Structure
```typescript
// Firestore: /profiles/{uid}
{
  uid: string,
  fullName: string,
  tower: string,
  apartmentNumber: string,
  phone: string,
  verified: boolean,
  role: 'tenant' | 'owner' | 'admin',
  assignedBy?: string,      // UID of admin who assigned the role
  assignedAt?: Date,        // When role was assigned
  createdAt: Date,
  updatedAt: Date
}

// Firebase Auth Custom Claims
{
  role: 'tenant' | 'owner' | 'admin'
}
```

### Security Rules
- **Firestore**: Role-based read/write permissions
- **Storage**: PDF upload restricted to owners/admins
- **Authentication**: Custom claims used for client-side authorization

## Usage Instructions

### For Admins
1. Navigate to Profile page
2. Scroll to "User Management" section
3. Select new role from dropdown for any user
4. Changes apply immediately

### For New Users
1. Sign in with phone number
2. Automatically assigned "tenant" role
3. Complete profile verification
4. Contact admin for role upgrade if needed

### Manual Role Sync (if needed)
```bash
# Sync all user roles
node scripts/sync-all-user-roles.js

# Sync specific user
node scripts/sync-user-role.js <uid> <role>
```

## Role-Based Feature Access

| Feature | Tenant | Owner | Admin |
|---------|--------|-------|-------|
| Submit Concerns | ✅ | ✅ | ✅ |
| View Concerns | ✅ | ✅ | ✅ |
| Upvote Concerns | ✅ | ✅ | ✅ |
| Upload Files | ❌ | ✅ | ✅ |
| View Files | ❌ | ✅ | ✅ |
| Delete Concerns | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Admin Dashboard | ❌ | ❌ | ✅ |

## Security Considerations

1. **Default Security**: New users start with minimal permissions
2. **Admin Control**: Role escalation requires admin approval
3. **Audit Trail**: Role changes are tracked with assignor and timestamp
4. **Claim Sync**: Both Firestore and Auth claims are kept consistent
5. **Self-Service Prevention**: Users cannot change their own roles