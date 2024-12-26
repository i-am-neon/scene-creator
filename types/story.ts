export type Story = {
  id: number;
  createdAt: string;
  title: string;
  worldIdea: string;
  worldOverview: {
    history: string;
  };
  storyOverview: {
    premise: string;
  };
};

