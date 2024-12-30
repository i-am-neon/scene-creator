import { Button } from "@/components/ui/button";
import readStory from "@/db/story/read-story";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { createSceneWithCharacters } from "./actions/create-scene-with-characters";
import CharactersGrid from "./components/characters-grid";

export default async function StoriesPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const story = await readStory((await params).id);
  if (!story) {
    notFound();
  }
  return (
    <Suspense fallback={<div>Loading interactions...</div>}>
      <div className="flex flex-1 flex-col p-8 items-center">
        <Image
          alt=""
          src={story.imageUrl}
          width={192}
          height={192}
          className="mx-auto size-48 shrink-0 rounded-lg"
        />
        <h3 className="mt-6 text-sm font-medium text-gray-900">
          {story.title}
        </h3>
        <dl className="mt-1 flex grow flex-col justify-between">
          <dt className="sr-only">Title</dt>
          <dd className="text-sm text-gray-500">{story.worldIdea}</dd>
          <dt className="sr-only">Role</dt>
        </dl>
        <Button onClick={createSceneWithCharacters}>Create</Button>
        <br />
        <br />
        <CharactersGrid storyId={story.id} />
      </div>
    </Suspense>
  );
}

