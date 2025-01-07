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
      // One Piece inspired - Classic adventure with supernatural powers
      "A world where pirates gain supernatural abilities by consuming cursed fruits while sailing across vast oceans in search of the ultimate treasure.",

      // Dark Fantasy / Berserk inspired - Gothic horror meets dark fantasy
      "A dark medieval realm where branded humans struggle against demonic forces while cosmic horror entities manipulate fate.",

      // Cyberpunk / Altered Carbon inspired - Technological immortality
      "A future where human consciousness can be digitally transferred between bodies, turning death into a mere inconvenience for the wealthy.",

      // Post-apocalyptic / Fallout inspired - Survival in ruins
      "A post-apocalyptic wasteland where survivors scavenge for resources while fending off mutated creatures and rival factions.",

      // Spirited Away inspired - Mystical eastern fantasy
      "An enchanted bathhouse between the mortal and spirit worlds where supernatural beings come to rejuvenate, and humans who enter risk being transformed.",

      // Eco-fantasy - Environmental conflict
      "A world where magic is a finite resource that can be extracted from the environment, leading to a conflict between industrialization and conservation.",

      // High Fantasy - Political intrigue with dragons
      "An ancient realm where seven grand kingdoms vie for control of mystical ley lines, while dragons serve as both allies and weapons of war.",

      // Steampunk - Victorian sci-fi adventure
      "A Victorian-era metropolis powered by aether engines, where sky pirates traverse the clouds in brass dirigibles and mechanical wonders blur the line between human and machine.",

      // Space Western - Bounty hunting across the stars
      "A solar system where bounty hunters chase criminals through bustling space colonies and abandoned terraforming projects, while dealing with their own haunted pasts.",

      // Colossal Fantasy - Living cities
      "A world where cities exist within the bodies of colossal sleeping giants, and citizens must maintain the balance between urban development and their titanic hosts' well-being.",

      // Dream Commerce - Reality-bending economy
      "A realm where dreams are tangible substances that can be harvested, traded, and consumed, leading to a society built around the commerce of imagination.",

      // Aquapunk - Underwater civilization
      "An undersea civilization thriving in the ruins of a flooded world, where humans have evolved bioluminescent traits and negotiate uneasy alliances with ancient deep-sea entities.",

      // Nomadic Fantasy - Seasonal epic
      "A land where seasons last for generations and nomadic clans follow magical meridians that shift across the landscape like celestial rivers.",

      // Urban Magic Realism - Street art meets cyberpunk
      "A cyberpunk metropolis where street artists wage corporate warfare through reality-altering graffiti, and memories can be painted directly onto the walls of consciousness.",
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

