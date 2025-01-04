import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readScene } from "@/db/scene/read-scene";
import { notFound } from "next/navigation";
import ScriptPlayer from "./components/script-player";

export default async function ScenePage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const scene = await readScene((await params).id);

  if (!scene) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">{scene.title}</h1>
          <p className="text-lg text-muted-foreground">Scene {scene.order}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{scene.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Character Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(scene.characterPositions).map(
                ([name, position]) => (
                  <Badge key={name} variant="secondary">
                    {name}: {position}
                  </Badge>
                )
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Script</CardTitle>
          </CardHeader>
          <CardContent>
            <ScriptPlayer script={scene.script} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

