import { useState, useCallback } from 'react';
import { getAllUsers, assignRole, removeRole, UserWithId } from '@/lib/adminUtils';
import { UserRole } from '@/lib/types';
import { useToast } from './use-toast';

export function useUserManagement() {
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateUserRole = useCallback(async (
    userId: string, 
    newRole: UserRole | 'none',
    assignedByUserId: string
  ) => {
    try {
      if (newRole === 'none') {
        await removeRole(userId);
      } else {
        await assignRole(userId, newRole, assignedByUserId);
      }
      
      await loadUsers();
      toast({
        title: "Success",
        description: `Role ${newRole === 'none' ? 'removed' : 'assigned'} successfully`
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive"
      });
    }
  }, [loadUsers, toast]);

  return {
    users,
    loading,
    loadUsers,
    updateUserRole
  };
}