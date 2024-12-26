import CreateStoryUI from "@/components/create-story-ui";
import StoriesGrid from "@/components/stories-grid";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <CreateStoryUI />

      <StoriesGrid />
    </div>
  );
}

