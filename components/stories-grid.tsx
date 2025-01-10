import readAllStories from "@/db/story/read-all-stories";
import { Story } from "@/types/story";
import Image from "next/image";
import Link from "next/link";

async function getData(): Promise<Story[]> {
  return await readAllStories();
}

export default async function StoriesGrid() {
  const stories = await getData();
  return (
    <ul
      role="list"
      className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
    >
      {stories.map((story) => (
        <Link href={`/stories/${story.id}`} key={story.id}>
          <li className="col-span-1 flex flex-col divide-y divide-gray-200 dark:divide-gray-800 rounded-lg bg-white dark:bg-gray-950 text-center shadow hover:shadow-lg transition-shadow">
            <div className="flex flex-1 flex-col p-4">
              <div className="relative w-full aspect-video overflow-hidden rounded-lg">
                <Image
                  alt=""
                  src={story.imageUrl}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                {story.title}
              </h3>
              <dl className="mt-1 flex grow flex-col justify-between">
                <dt className="sr-only">Title</dt>
                <dd className="text-sm text-gray-500 dark:text-gray-400">
                  {story.worldIdea}
                </dd>
                <dt className="sr-only">Role</dt>
              </dl>
            </div>
          </li>
        </Link>
      ))}
    </ul>
  );
}
