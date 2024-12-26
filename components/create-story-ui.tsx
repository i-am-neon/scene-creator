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
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Shuffle } from "lucide-react";

export default function CreateStoryUI() {
  const [showCreateStory, setShowCreateStory] = useState(false);

  return (
    <div>
      {showCreateStory ? (
        <CreateStoryForm />
      ) : (
        <Button onClick={() => setShowCreateStory(true)}>Create Story!</Button>
      )}
    </div>
  );
}

function CreateStoryForm() {
  const formSchema = z.object({
    worldIdea: z.string().min(1),
  });

  const PRESETS = useMemo(
    () => [
      "A peaceful forest planet",
      "A floating island city",
      "A sunken Atlantis world",
    ],
    []
  );

  const [shuffleIndex, setShuffleIndex] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      worldIdea: "",
    },
  });

  const handleShuffle = useCallback(() => {
    const next = (shuffleIndex + 1) % PRESETS.length;
    setShuffleIndex(next);
  }, [PRESETS.length, shuffleIndex]);

  useEffect(() => {
    form.setValue("worldIdea", PRESETS[shuffleIndex]);
  }, [shuffleIndex, form, PRESETS]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 min-w-80"
      >
        <FormField
          control={form.control}
          name="worldIdea"
          render={({ field }) => (
            <FormItem>
              <FormLabel>World Idea</FormLabel>
              <FormControl>
                <Textarea placeholder="World description" {...field} />
              </FormControl>
              <FormDescription>A one sentence description.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={handleShuffle}>
            <Shuffle />
          </Button>
          <Button type="submit">Submit</Button>
        </div>
      </form>
    </Form>
  );
}

