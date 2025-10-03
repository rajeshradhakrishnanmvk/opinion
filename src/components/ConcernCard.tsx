"use client";

import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Concern } from "@/lib/types";
import { useUser } from "@/contexts/UserContext";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type ConcernCardProps = {
  concern: Concern;
  onUpvote: (id: string) => void;
};

export function ConcernCard({ concern, onUpvote }: ConcernCardProps) {
  const { user, setIdentityDialogOpen, setPendingAction } = useUser();
  
  const hasUpvoted = user ? concern.upvotedBy.includes(user.apartmentNumber) : false;

  const handleUpvoteClick = () => {
    if (hasUpvoted) return;

    if (!user) {
      setPendingAction(() => () => onUpvote(concern.id));
      setIdentityDialogOpen(true);
    } else {
      onUpvote(concern.id);
    }
  };

  return (
    <Card className="flex flex-col sm:flex-row transition-all hover:shadow-md">
      <div className="flex sm:flex-col items-center justify-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r bg-muted/50">
        <Button
          variant={hasUpvoted ? "default" : "outline"}
          size="lg"
          className={cn(
            "flex flex-col h-auto p-2 gap-1 transition-all active:scale-95",
            hasUpvoted && "bg-primary text-primary-foreground",
            !hasUpvoted && "hover:bg-primary/10"
            )}
          onClick={handleUpvoteClick}
          disabled={hasUpvoted}
          aria-label={`Upvote concern. Current upvotes: ${concern.upvotes}`}
        >
          <ArrowUp className="h-5 w-5" />
          <span className="text-lg font-bold">{concern.upvotes}</span>
        </Button>
      </div>
      <div className="flex-1">
        <CardHeader>
          <CardTitle className="font-headline text-xl">{concern.title}</CardTitle>
          <CardDescription>
            Posted by {concern.authorName}
          </CardDescription>
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
