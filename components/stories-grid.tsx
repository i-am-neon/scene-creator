import readAllStories from "@/db/story/read-all-stories";
import { Story } from "@/types/story";
import Image from "next/image";

async function getData(): Promise<Story[]> {
  return await readAllStories();
}

export default async function StoriesGrid() {
  const stories = await getData();
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {stories.map((story) => (
        <li
          key={story.id}
          className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-white text-center shadow"
        >
          <div className="flex flex-1 flex-col p-8">
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
          </div>
        </li>
      ))}
    </ul>
  );
}

