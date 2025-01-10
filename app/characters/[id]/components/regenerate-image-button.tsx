// app/characters/[id]/components/regenerate-image-button.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";
import regenerateCharacterPortrait from "../actions";

export default function RegenerateImageButton({
  characterId,
}: {
  characterId: number;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegenerate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await regenerateCharacterPortrait(characterId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to regenerate image"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleRegenerate}
        disabled={isLoading}
      >
        {isLoading ? (
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        Regenerate Image
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

