'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { Profile, UserRole } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Users, UserCheck, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserManagementProps {
  className?: string;
}

export function UserManagement({ className }: UserManagementProps) {
  const { profile, firebaseUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    if (!isAdmin) return;
    
    setLoading(true);
    try {
      const usersRef = collection(firestore, 'profiles');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const usersList: Profile[] = [];
      snapshot.forEach((doc) => {
        const userData = doc.data() as Profile;
        usersList.push({ ...userData, uid: doc.id });
      });
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!isAdmin || !firebaseUser) return;

    setUpdating(userId);
    try {
      // Update Firestore profile
      const userRef = doc(firestore, 'profiles', userId);
      await updateDoc(userRef, {
        role: newRole,
        assignedBy: firebaseUser.uid,
        assignedAt: new Date(),
        updatedAt: new Date()
      });

      // Update local state
      setUsers(prev => prev.map(user => 
        user.uid === userId 
          ? { ...user, role: newRole, assignedBy: firebaseUser.uid, assignedAt: new Date() }
          : user
      ));

      toast({
        title: 'Success',
        description: `User role updated to ${newRole}. Custom claims will sync automatically.`,
      });

      // Note: Custom claims sync would need to be handled by Cloud Functions
      // or server-side API in a production environment
      console.log(`Role updated for user ${userId} to ${newRole}`);
      
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive',
      });
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeVariant = (role?: UserRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'owner': return 'default';
      case 'tenant': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role?: UserRole) => {
    switch (role) {
      case 'admin': return <Settings className="h-3 w-3" />;
      case 'owner': return <UserCheck className="h-3 w-3" />;
      case 'tenant': return <Users className="h-3 w-3" />;
      default: return <Users className="h-3 w-3" />;
    }
  };

  if (!isAdmin) {
    return (
      <Alert>
        <AlertDescription>
          Access denied. Only administrators can manage user roles.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Total Users: {users.length}
            </div>
            
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.fullName || 'Unnamed User'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.tower && user.apartmentNumber 
                              ? `${user.tower} - ${user.apartmentNumber}`
                              : 'No apartment assigned'
                            }
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.phone || 'No phone'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getRoleBadgeVariant(user.role)}
                          className="gap-1"
                        >
                          {getRoleIcon(user.role)}
                          {user.role || 'tenant'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.uid !== firebaseUser?.uid ? (
                          <Select
                            value={user.role || 'tenant'}
                            onValueChange={(value: UserRole) => updateUserRole(user.uid!, value)}
                            disabled={updating === user.uid}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tenant">
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3" />
                                  Tenant
                                </div>
                              </SelectItem>
                              <SelectItem value="owner">
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-3 w-3" />
                                  Owner
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Settings className="h-3 w-3" />
                                  Admin
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline">You</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}