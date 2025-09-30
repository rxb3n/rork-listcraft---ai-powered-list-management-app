export type Category = "groceries" | "recipe" | "building" | "workout" | "custom";

export const categories: Category[] = ["groceries", "recipe", "building", "workout", "custom"];

export type ListItem = {
  id: string;
  title: string;
  quantity?: string;
  note?: string;
  completed: boolean;
};

export type List = {
  id: string;
  title: string;
  category: Category;
  createdAt: number;
  items: ListItem[];
};

export type NewListPayload = {
  title: string;
  category: Category;
  items?: Array<Pick<ListItem, "title" | "quantity" | "note">>;
};

export type UpdateListPayload = {
  id: string;
  title?: string;
  items?: ListItem[];
};

export type GenerationParams = {
  category: Category;
  description: string;
  people?: number;
  budget?: string;
  currency?: string;
  workoutBodyPart?: "full body" | "arms" | "legs" | "back" | "chest" | "shoulders" | "abs" | "glutes";
  workoutMode?: "cardio" | "lifting" | "calisthenics";
  intensity?: "low" | "medium" | "high";
};

export type GeneratedList = {
  title: string;
  items: Array<{
    title: string;
    quantity?: string;
    note?: string;
  }>;
};