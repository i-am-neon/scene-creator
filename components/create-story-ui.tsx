"use client";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Shuffle } from "lucide-react";
export default function CreateStoryUI() {
  "use client";
  const [showCreateStory, setShowCreateStory] = useState(false);

  return (
    <div>
      {showCreateStory ? (
        <CreateStoryForm />
      ) : (
        <Button onClick={() => setShowCreateStory(true)}>Create Story!@</Button>
      )}
    </div>
  );
}

function CreateStoryForm() {
  const formSchema = z.object({
    worldIdea: z.string().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      worldIdea: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="worldIdea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>World Idea</FormLabel>
              <FormControl>
                <Textarea placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                A one sentence description of the world to create.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button variant="outline" type="button">
            <Shuffle />
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}

