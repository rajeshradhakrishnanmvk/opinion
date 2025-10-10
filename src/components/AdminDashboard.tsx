"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllUsers, UserWithId } from '@/lib/adminUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, Home, UserCheck } from 'lucide-react';

export function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: users.length,
    verified: users.filter(u => u.verified).length,
    admins: users.filter(u => u.role === 'admin').length,
    owners: users.filter(u => u.role === 'owner').length,
    tenants: users.filter(u => u.role === 'tenant').length,
    unassigned: users.filter(u => !u.role).length
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? '...' : stats.total}</div>
          <p className="text-xs text-muted-foreground">
            {loading ? '...' : stats.verified} verified
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Admins</CardTitle>
          <Shield className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {loading ? '...' : stats.admins}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Owners</CardTitle>
          <Home className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {loading ? '...' : stats.owners}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tenants</CardTitle>
          <UserCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {loading ? '...' : stats.tenants}
          </div>
          <p className="text-xs text-muted-foreground">
            {loading ? '...' : stats.unassigned} unassigned
          </p>
        </CardContent>
      </Card>
    </div>
  );
}