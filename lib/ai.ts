import { z } from "zod";
import { generateObject } from "@rork/toolkit-sdk";
import { Category, GenerationParams, GeneratedList } from "@/types/list";

const itemSchema = z.object({
  title: z.string(),
  quantity: z.string().optional(),
  note: z.string().optional(),
});

const outputSchema = z.object({
  title: z.string(),
  items: z.array(itemSchema).min(1),
});

function categoryPrompt(category: Category, p: GenerationParams): string {
  switch (category) {
    case "recipe":
      return `Create a concise shopping list for the following recipe. Include quantities and short notes when needed.
Recipe: ${p.description}
People: ${p.people ?? 2}
Format: JSON with {title, items:[{title, quantity?, note?}]}`;
    case "groceries":
      return `Create a practical grocery list. Consider budget, currency, and people.
People: ${p.people ?? 2}
Budget: ${p.budget ?? "flexible"}
Currency: ${p.currency ?? "USD"}
Format: JSON with {title, items:[{title, quantity?, note?}]}`;
    case "building":
      return `Create a building materials & tools list with clear items and optional quantities.
Project: ${p.description}
Format: JSON with {title, items:[{title, quantity?, note?}]}`;
    case "workout":
      return `Create a cohesive, realistic weekly workout plan as a checklist of exercises based on the parameters below. Put reps/sets or duration in the quantity field and short coaching notes in note.
Mode: ${p.workoutMode ?? "lifting"}
Body part: ${p.workoutBodyPart ?? "full body"}
Intensity: ${p.intensity ?? "medium"}
People: ${p.people ?? 1}
Constraints: Avoid unsafe volumes; include rest days; balance push/pull; scale volume to intensity.
Format: JSON with {title, items:[{title, quantity?, note?}]}`;
    default:
      return `Create a well-structured checklist.
Context: ${p.description}
Format: JSON with {title, items:[{title, quantity?, note?}]}`;
  }
}

export async function generateListWithAI(params: GenerationParams): Promise<GeneratedList> {
  const prompt = categoryPrompt(params.category, params);
  const result = await generateObject({
    messages: [{ role: "user", content: prompt }],
    schema: outputSchema,
  });
  return result as GeneratedList;
}