'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { RotateCcw } from 'lucide-react';

export function TokenRefreshButton() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const refreshToken = async () => {
    if (!auth.currentUser) {
      toast({
        title: 'Error',
        description: 'Please sign in first',
        variant: 'destructive',
      });
      return;
    }

    setIsRefreshing(true);
    try {
      // Force refresh the ID token to get latest custom claims
      await auth.currentUser.getIdToken(true);
      
      // Get the refreshed token to verify claims
      const tokenResult = await auth.currentUser.getIdTokenResult();
      
      toast({
        title: 'Success',
        description: `Token refreshed. Role: ${tokenResult.claims.role || 'none'}`,
      });
      
      // Reload the page to apply changes
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing token:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh token',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      onClick={refreshToken}
      disabled={isRefreshing}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RotateCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {isRefreshing ? 'Refreshing...' : 'Refresh Permissions'}
    </Button>
  );
}