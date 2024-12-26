import readAllStories from "@/db/story/read-all-stories";
import { Story } from "@/types/story";

async function getData(): Promise<Story[]> {
  return await readAllStories();
}

export default async function HomePage() {
  const stories = await getData();
  console.log("stories :>> ", stories);
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
            <img
              alt=""
              src={
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
              }
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

