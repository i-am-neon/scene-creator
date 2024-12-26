"use server";
import insertStory from "@/db/insert-story";

export async function addStory() {
  await insertStory({
    title: "The Story",
    worldIdea: "The World",
    worldOverview: {
      history: "The History",
    },
    storyOverview: {
      premise: "The Premise",
    },
  });
}

