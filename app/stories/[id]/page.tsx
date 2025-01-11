import readStory from "@/db/story/read-story";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CharactersGrid from "./components/characters-grid";
import CreateSceneButton from "./components/create-scene-button";
import ScenesGrid from "./components/scenes-grid";

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
        <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden">
          <Image
            alt=""
            src={story.imageUrl}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <h3 className="mt-6 text-xl font-medium text-gray-900">
          {story.title}
        </h3>
        <dl className="mt-1 flex grow flex-col justify-between">
          <dt className="sr-only">Title</dt>
          <dd className="text-sm text-gray-500">{story.worldIdea}</dd>
          <dt className="sr-only">Role</dt>
        </dl>
        <br />
        <CreateSceneButton storyId={story.id} />
        <br />
        <br />
        <h2 className="text-4xl">Characters</h2>
        <br />
        <CharactersGrid storyId={story.id} />
        <br />
        <br />
        <h2 className="text-4xl">Scenes</h2>
        <br />
        <ScenesGrid storyId={story.id} />
      </div>
    </Suspense>
  );
}

