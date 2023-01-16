import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function getInferredKinds(
  objectName: string
): Promise<string[]> {
  try {
    const completion = await openai.createCompletion({
      model: "text-curie-001",
      prompt: generatePrompt(objectName),
      temperature: 0.3,
    });
    return completion.data.choices[0].text?.split(",") || [];
  } catch (error: any) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.warn(error.response.status, error.response.data);
    } else {
      console.warn(`Error with OpenAI API request: ${error.message}`);
    }
    return [];
  }
}

function generatePrompt(objectName: string) {
  const adjectives = [
    "touchable",
    "container",
    "supporter",
    "visible",
    "flammable",
    "carryable",
  ];

  return `Which of the following things could be used to describe a ${objectName}: ${adjectives.join(
    ","
  )}?
  List them like this "touchable,supporter,carryable".
  `;
}
