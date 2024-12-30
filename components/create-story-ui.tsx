"use client";
import { createStory } from "@/app/actions";
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
import { LoaderCircle, Shuffle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

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
  const [isLoading, setIsLoading] = useState(false);
  const formSchema = z.object({
    worldIdea: z.string().min(1),
  });

  const PRESETS = useMemo(
    () => [
      "A world where pirates gain supernatural abilities by consuming cursed fruits while sailing across vast oceans in search of the ultimate treasure.",
      "A dark medieval realm where branded humans struggle against demonic forces while cosmic horror entities manipulate fate.",
      "A future where human consciousness can be digitally transferred between bodies, turning death into a mere inconvenience for the wealthy.",
      "A post-apocalyptic wasteland where survivors scavenge for resources while fending off mutated creatures and rival factions.",
      "An enchanted bathhouse between the mortal and spirit worlds where supernatural beings come to rejuvenate, and humans who enter risk being transformed.",
      "A world where magic is a finite resource that can be extracted from the environment, leading to a conflict between industrialization and conservation.",
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const worldIdea = values.worldIdea;
    setIsLoading(true);
    try {
      await createStory(worldIdea);
    } catch (error) {
      console.error(error);
      form.setError("worldIdea", {
        message: "An error occurred while generating story",
      });
    } finally {
      setIsLoading(false);
    }
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Create Story"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

