"use client";

import { ArrowUp, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Concern } from "@/lib/types";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type ConcernCardProps = {
  concern: Concern;
  onUpvote: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  showDeleted?: boolean;
};

export function ConcernCard({ 
  concern, 
  onUpvote, 
  onDelete, 
  onRestore, 
  showDeleted: _showDeleted = false // eslint-disable-line @typescript-eslint/no-unused-vars
}: ConcernCardProps) {
  const { user, setIdentityDialogOpen, setPendingAction } = useUser();
  const { profile } = useAuth();
  
  const hasUpvoted = user ? concern.upvotedBy.includes(user.apartmentNumber) : false;
  const isAdmin = profile?.role === 'admin';
  const canDelete = isAdmin && !concern.isDeleted;
  const canRestore = isAdmin && concern.isDeleted;

  const handleUpvoteClick = () => {
    if (hasUpvoted || concern.isDeleted) return;

    if (!user) {
      setPendingAction(() => () => onUpvote(concern.id));
      setIdentityDialogOpen(true);
    } else {
      onUpvote(concern.id);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(concern.id);
    }
  };

  const handleRestore = () => {
    if (onRestore) {
      onRestore(concern.id);
    }
  };

  return (
    <Card className={cn(
      "flex flex-col sm:flex-row transition-all hover:shadow-md",
      concern.isDeleted && "opacity-60 bg-muted/20 border-dashed"
    )}>
      <div className="flex sm:flex-col items-center justify-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r bg-muted/50">
        <Button
          variant={hasUpvoted ? "default" : "outline"}
          size="lg"
          className={cn(
            "flex flex-col h-auto p-2 gap-1 transition-all active:scale-95",
            hasUpvoted && "bg-primary text-primary-foreground",
            !hasUpvoted && "hover:bg-primary/10",
            concern.isDeleted && "opacity-50"
            )}
          onClick={handleUpvoteClick}
          disabled={hasUpvoted || concern.isDeleted}
          aria-label={`Upvote concern. Current upvotes: ${concern.upvotes}`}
        >
          <ArrowUp className="h-5 w-5" />
          <span className="text-lg font-bold">{concern.upvotes}</span>
        </Button>
      </div>
      <div className="flex-1">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="font-headline text-xl">{concern.title}</CardTitle>
              <CardDescription>
                Posted by {concern.authorName}
                {concern.isDeleted && concern.deletedAt && (
                  <span className="ml-2 text-destructive">
                    • Deleted {formatDistanceToNow(new Date(concern.deletedAt), { addSuffix: true })}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {concern.isDeleted && (
                <Badge variant="destructive">Deleted</Badge>
              )}
              {canRestore && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRestore}
                  className="h-8"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Restore
                </Button>
              )}
              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Concern</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this concern? This will hide it from all users but can be restored later.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{concern.description}</p>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            {concern.createdAt && !isNaN(new Date(concern.createdAt).getTime())
              ? formatDistanceToNow(new Date(concern.createdAt), { addSuffix: true })
              : "Unknown time"}
          </p>
        </CardFooter>
      </div>
    </Card>
  );
}
