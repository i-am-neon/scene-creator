import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readSceneCharacters } from "@/db/scene-character/read-scene-characters";
import { readScene } from "@/db/scene/read-scene";
import Image from "next/image";
import { notFound } from "next/navigation";
import ScenePlayer from "./components/scene-player";
import ScriptPlayer from "./components/script-player";

export default async function ScenePage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const sceneId = (await params).id;
  const scene = await readScene(sceneId);
  const characters = await readSceneCharacters(sceneId);
  if (!scene) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="relative w-full h-96">
        <Image
          src={scene.backgroundImageUrl}
          alt={scene.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/20" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto">
            <h1 className="text-4xl font-bold text-foreground">
              {scene.title}
            </h1>
            <p className="text-xl text-muted-foreground">Scene {scene.order}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto space-y-6">
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

        <ScenePlayer scene={scene} characters={characters} />

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

