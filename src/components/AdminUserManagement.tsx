"use client";

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserManagement } from '@/hooks/useUserManagement';
import { UserRole } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminUserManagement() {
  const { firebaseUser, isAdmin } = useAuth();
  const { users, loading, loadUsers, updateUserRole } = useUserManagement();

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin, loadUsers]);

  const handleRoleChange = async (userId: string, newRole: UserRole | 'none') => {
    if (!firebaseUser) return;
    await updateUserRole(userId, newRole, firebaseUser.uid);
  };

  const getRoleBadgeVariant = (role?: UserRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'owner': return 'default';
      case 'tenant': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleColor = (role?: UserRole) => {
    switch (role) {
      case 'admin': return 'text-red-600';
      case 'owner': return 'text-blue-600';
      case 'tenant': return 'text-green-600';
      default: return 'text-gray-500';
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage user roles and permissions ({users.length} total users)
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-9 w-32" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No users found</p>
              ) : (
                users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{user.fullName}</p>
                            {user.verified && (
                              <Badge variant="outline" className="text-xs">✓ Verified</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Tower {user.tower} - Apt {user.apartmentNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                          {user.role && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground">Role assigned by:</span>
                              <span className={getRoleColor(user.role)}>{user.assignedBy || 'Unknown'}</span>
                              {user.assignedAt && (
                                <span className="text-muted-foreground">
                                  on {new Date(user.assignedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1">
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role || 'No Role'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={user.role || 'none'}
                        onValueChange={(value) => handleRoleChange(user.id, value as UserRole | 'none')}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Role</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="tenant">Tenant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}