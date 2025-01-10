import CreateStoryUI from "@/components/create-story-ui";
import StoriesGrid from "@/components/stories-grid";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8 items-center justify-center min-h-screen py-2">
      <ThemeToggle />
      <CreateStoryUI />
      <StoriesGrid />
    </div>
  );
}

