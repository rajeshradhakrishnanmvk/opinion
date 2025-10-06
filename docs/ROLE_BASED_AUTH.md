# Role-Based Authentication System

This application now includes a comprehensive role-based authentication system with admin capabilities for managing users and assigning roles.

## Features

### User Roles
- **Admin**: Full access to user management, can assign/remove roles to other users
- **Owner**: Property owners (can be assigned by admin)
- **Tenant**: Property tenants (can be assigned by admin)
- **Unassigned**: Regular users without specific roles

### Admin Capabilities
- View all registered users
- Assign roles to users (admin, owner, tenant)
- Remove roles from users
- View user statistics dashboard
- Access admin panel through profile page

### Role Assignment
- Only admins can assign roles to other users
- Roles are stored both in Firestore custom claims and user profile documents
- Role assignments include metadata (assigned by, assigned at timestamp)

## Technical Implementation

### Components
- `AdminUserManagement`: Main admin interface for managing users
- `AdminDashboard`: Statistics dashboard showing user counts by role
- Role badges and indicators in Header component
- Enhanced profile page with admin functionality

### Hooks
- `useUserManagement`: Hook for managing user roles and loading user lists
- Enhanced `useAuth`: Now includes `isAdmin` boolean for role checking

### Utilities
- `adminUtils.ts`: Functions for user management, role assignment
- Role validation and user listing functions

### Types
- `UserRole`: Type definition for roles (admin, owner, tenant)
- Enhanced `Profile` type with role information

## Setup Instructions

### 1. Initial Admin Setup
The system requires at least one admin user to be set up initially. This has been done using Firebase MCP tools:

```bash
# Admin user assigned:
UID: 4aKf3r5doRewP6GT3G7K5XTPjEN2
Name: Rajesh Radhakrishnan
Role: admin
```

### 2. Admin User Management
Once logged in as an admin:
1. Navigate to Profile page
2. View admin dashboard with user statistics
3. Scroll down to "User Management" section
4. Assign roles using dropdown menus for each user

### 3. Role Assignment Process
- Select a user from the list
- Choose role from dropdown (Admin, Owner, Tenant, or No Role)
- Changes are applied immediately
- Assignment metadata is tracked

## Security Features

### Access Control
- Admin panel only visible to users with admin role
- Role assignment functions protected server-side
- Firebase custom claims used for additional security
- Profile verification required for role assignment

### Data Protection
- Role assignments tracked with metadata
- Audit trail of who assigned roles and when
- Firebase security rules enforce role-based access

## User Interface

### Role Indicators
- Role badges displayed in header for logged-in users
- Color-coded role badges (Admin: red, Owner: blue, Tenant: green)
- Verification status indicators
- Admin panel clearly labeled in navigation

### Admin Dashboard
- User count statistics by role
- Visual indicators for each role type
- Loading states and error handling
- Responsive design for mobile devices

## Database Structure

### Firestore Collections
```
profiles/{userId}
  - fullName: string
  - tower: string
  - apartmentNumber: string
  - phone: string
  - verified: boolean
  - role?: 'admin' | 'owner' | 'tenant'
  - assignedBy?: string (userId of admin who assigned role)
  - assignedAt?: Timestamp
```

### Firebase Auth Custom Claims
```
customClaims: {
  role: 'admin' | 'owner' | 'tenant'
}
```

## Usage Examples

### Checking User Role in Components
```tsx
const { isAdmin, profile } = useAuth();

if (isAdmin) {
  // Show admin-only content
}

if (profile?.role === 'owner') {
  // Show owner-specific content
}
```

### Managing Users (Admin Only)
```tsx
const { users, updateUserRole } = useUserManagement();

// Assign role
await updateUserRole(userId, 'owner', currentAdminId);
```

## Future Enhancements

### Planned Features
- Role-specific permissions for concerns (e.g., owners can moderate)
- Bulk role assignment capabilities
- Role history and audit logs
- Email notifications for role assignments
- Advanced filtering and search in user management

### Security Improvements
- Two-factor authentication for admin users
- Role expiration dates
- IP-based access restrictions
- Enhanced audit logging

## Troubleshooting

### Common Issues
1. **Admin not showing admin panel**: Ensure both Firestore role and custom claims are set
2. **Role assignment failing**: Check admin permissions and Firebase security rules
3. **User list not loading**: Verify Firestore permissions and network connectivity

### Debug Commands
```bash
# Check user custom claims
firebase auth:export users.json --project nammal-e6351

# Verify Firestore documents
# Use Firebase Console to inspect profiles collection
```

## Support
For issues or questions about the role-based authentication system, refer to the Firebase documentation or check the application logs for detailed error messages.