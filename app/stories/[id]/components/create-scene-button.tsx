"use client";

import { Button } from "@/components/ui/button";
import createSceneWithCharacters from "../actions";
import { LoaderCircle } from "lucide-react";
import { useCallback, useState } from "react";

export default function CreateSceneButton({ storyId }: { storyId: number }) {
  const [isLoading, setIsLoading] = useState(false);

  const createScene = useCallback(async () => {
    setIsLoading(true);
    try {
      await createSceneWithCharacters(storyId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [storyId]);

  return (
    <Button onClick={createScene}>
      {isLoading ? <LoaderCircle className="animate-spin" /> : "Create Scene"}
    </Button>
  );
}

