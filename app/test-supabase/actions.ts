"use server";
import insertStory from "@/db/story/insert-story";
import readStory from "@/db/story/read-story";

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

export async function getStory() {
  const story = await readStory(1);
  console.log("story :>> ", story);
}

