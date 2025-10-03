"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@/contexts/UserContext";
import { verifyIdentity } from "@/ai/flows/verify-identity";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const verificationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  apartmentNumber: z.string().min(1, "Apartment number is required."),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

export function IdentityVerificationDialog() {
  const {
    isIdentityDialogOpen,
    setIdentityDialogOpen,
    setUser,
    pendingAction,
    setPendingAction,
  } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { name: "", apartmentNumber: "" },
  });

  const onSubmit = async (data: VerificationFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/verify-identity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (response.ok && result.isValidIdentity) {
        const verifiedUser = {
          name: data.name,
          apartmentNumber: data.apartmentNumber,
        };
        setUser(verifiedUser);
        setIdentityDialogOpen(false);
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
        toast({
          title: "Identity Verified",
          description: "Thank you for verifying your identity.",
        });
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: result.reason || "Please check your details and try again.",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (isLoading) return;
    setIdentityDialogOpen(open);
    if(!open) {
      setPendingAction(null);
      form.reset();
    }
  }

  return (
    <Dialog open={isIdentityDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Verify Your Identity</DialogTitle>
          <DialogDescription>
            Please provide your name and apartment number to post or upvote a
            concern. This helps keep our community safe and accountable.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apartmentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apartment Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 4B" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Verify
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
