import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { readScenes } from "@/db/scene/read-scenes";
import { Scene } from "@/types/scene";
import Image from "next/image";
import Link from "next/link";

async function getData(storyId: number): Promise<Scene[]> {
  return await readScenes(storyId);
}

export default async function ScenesGrid({ storyId }: { storyId: number }) {
  const scenes = await getData(storyId);

  return (
    <ul
      role="list"
      className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {scenes.map((scene) => (
        <Link href={`/scenes/${scene.id}`} key={scene.id}>
          <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
            <div className="relative w-full aspect-video">
              <Image
                src={scene.backgroundImageUrl}
                alt={scene.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardContent className="pt-6">
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold">{scene.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Scene {scene.order}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(scene.characterPositions).map(([name]) => (
                    <Badge key={name} variant="secondary">
                      {name}
                    </Badge>
                  ))}
                </div>
                <p className="mt-4 text-sm line-clamp-3">{scene.description}</p>
                <div className="mt-4">
                  <Badge variant="outline">{scene.script.length} lines</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </ul>
  );
}
