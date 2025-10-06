'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

export function AuthDebugPanel() {
  const { firebaseUser, profile } = useAuth();
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkToken = async () => {
    if (!auth.currentUser) return;
    
    setIsLoading(true);
    try {
      const tokenResult = await auth.currentUser.getIdTokenResult();
      setTokenInfo({
        claims: tokenResult.claims,
        expirationTime: tokenResult.expirationTime,
        issuedAtTime: tokenResult.issuedAtTime,
        signInProvider: tokenResult.signInProvider,
        token: tokenResult.token.substring(0, 50) + '...' // Truncate for display
      });
    } catch (error) {
      console.error('Error getting token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (firebaseUser) {
      checkToken();
    }
  }, [firebaseUser]);

  if (!firebaseUser) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Authentication Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <strong>User ID:</strong> {firebaseUser.uid}
          </div>
          <div>
            <strong>Phone:</strong> {firebaseUser.phoneNumber}
          </div>
          <div>
            <strong>Profile Role:</strong> 
            <Badge variant="secondary" className="ml-1">
              {profile?.role || 'none'}
            </Badge>
          </div>
          <div>
            <strong>Token Role:</strong> 
            <Badge variant="secondary" className="ml-1">
              {tokenInfo?.claims?.role || 'none'}
            </Badge>
          </div>
        </div>
        
        {tokenInfo && (
          <div className="text-xs space-y-1">
            <div><strong>Token Claims:</strong></div>
            <pre className="bg-muted p-2 rounded text-[10px] overflow-auto max-h-20">
              {JSON.stringify(tokenInfo.claims, null, 2)}
            </pre>
          </div>
        )}
        
        <Button 
          onClick={checkToken} 
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="w-full"
        >
          {isLoading ? 'Checking...' : 'Refresh Token Info'}
        </Button>
      </CardContent>
    </Card>
  );
}