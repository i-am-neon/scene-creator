import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Character } from "@/types/character";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { readCharacters } from "@/db/character/read-characters";

async function getData(storyId: number): Promise<Character[]> {
  return await readCharacters(storyId);
}

export default async function CharactersGrid({ storyId }: { storyId: number }) {
  const characters = await getData(storyId);
  return (
    <ul
      role="list"
      className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {characters.map((character) => (
        <Link href={`/characters/${character.id}`} key={character.id}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="aspect-[2/3] w-48 relative">
                  <Image
                    alt={`Portrait of ${character.displayName}`}
                    src={character.portraitUrl}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  {character.displayName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {character.fullName}
                </p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="secondary">Age: {character.age}</Badge>
                  <Badge variant="outline">{character.gender}</Badge>
                </div>
                <p className="mt-4 text-sm text-center line-clamp-2">
                  {character.personality}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </ul>
  );
}
