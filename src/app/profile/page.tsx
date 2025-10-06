"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { firestore } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useRouter } from "next/navigation";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  tower: z.string().min(1, "Tower is required"),
  apartmentNumber: z.string().regex(/^[a-zA-Z0-9-]+$/, "Alphanumeric only"),
  phone: z.string().min(8, "Phone required"),
});

type FormValues = z.infer<typeof schema>;

export default function ProfilePage() {
  const { firebaseUser, profile, refreshProfile, loading } = useAuth();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: profile?.fullName ?? "",
      tower: profile?.tower ?? "",
      apartmentNumber: profile?.apartmentNumber ?? "",
      phone: profile?.phone ?? "",
    },
  });

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push("/signin");
    }
  }, [firebaseUser, loading, router]);

  useEffect(() => {
    // when profile loads later, reset form
    if (profile) {
      form.reset({
        fullName: profile.fullName,
        tower: profile.tower,
        apartmentNumber: profile.apartmentNumber,
        phone: profile.phone,
      });
    }
  }, [profile]);

  const onSubmit = async (values: FormValues) => {
    if (!firebaseUser) return;
    const ref = doc(firestore, "profiles", firebaseUser.uid);
    await setDoc(ref, { ...values, verified: true }, { merge: true });
    await refreshProfile();
    router.push("/");
  };

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      <p className="text-sm text-muted-foreground mb-6">Verify your details to submit concerns.</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tower"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tower</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., A" {...field} />
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
                  <Input placeholder="e.g., 12B" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., +91 98xxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-2">
            <Button type="submit">Save & Verify</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
