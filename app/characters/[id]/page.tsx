import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readCharacter } from "@/db/character/read-character";
import Image from "next/image";
import { notFound } from "next/navigation";
import MyAudioPlayer from "./components/audio-player";

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const character = await readCharacter((await params).id);

  if (!character) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex gap-8">
        <div className="w-64 flex-shrink-0 space-y-4">
          <div className="aspect-[2/3] relative">
            <Image
              src={character.portraitUrl}
              alt={character.displayName}
              fill
              className="rounded-lg object-cover"
              priority
            />
          </div>
          {character.voiceSampleUrl && (
            <MyAudioPlayer url={character.voiceSampleUrl} />
          )}
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{character.displayName}</h1>
            <p className="text-lg text-muted-foreground">
              {character.fullName}
            </p>
          </div>

          <div className="flex gap-2">
            <Badge variant="secondary">Age: {character.age}</Badge>
            <Badge variant="outline">{character.gender}</Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Personality</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{character.personality}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backstory</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{character.backstory}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 space-y-2">
                  {character.goals.map((goal, index) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relationships</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-4 space-y-2">
                  {character.relationships.map((relationship, index) => (
                    <li key={index}>{relationship}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

