"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";

const concernSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters.")
    .max(100, "Title cannot be more than 100 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters.")
    .max(500, "Description cannot be more than 500 characters."),
});

type ConcernFormValues = z.infer<typeof concernSchema>;

type NewConcernDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateConcern: (title: string, description: string) => void;
};

export function NewConcernDialog({
  open,
  onOpenChange,
  onCreateConcern,
}: NewConcernDialogProps) {
  const form = useForm<ConcernFormValues>({
    resolver: zodResolver(concernSchema),
    defaultValues: { title: "", description: "" },
  });

  const onSubmit = (data: ConcernFormValues) => {
    onCreateConcern(data.title, data.description);
    form.reset();
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Submit a New Concern</DialogTitle>
          <DialogDescription>
            Share your concern with the community. Please be clear and
            respectful.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Broken light in hallway" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide more details about the issue."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Submit Concern</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
