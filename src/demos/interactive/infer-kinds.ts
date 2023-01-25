import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const Adjectives = [
  "supporter",
  "carryable",
  "container",
  "touchable",
  "character",
  "flammable",
];

export default async function getInferredKinds(
  objectName: string
): Promise<string[]> {
  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(objectName),
      temperature: 0,
      max_tokens: 20,
    });
    console.log("Raw answers from OpenAI", completion.data.choices[0].text);
    const answers = completion.data.choices[0].text?.trim().split("|") || [];
    console.log("Parsed answers from OpenAI", answers);
    if (answers.length !== Adjectives.length) {
      throw new Error("Incorrect number of answers from OpenAI");
    }
    const result = answers.flatMap((answer: string, index: number) => {
      if (index === 1) {
        const weightInKg = answer
          .replace(/^([\d\.\-,e]+)?.*kg/, "$1")
          .replace(/,/g, "");
        console.log(`Weight of ${objectName} is ${weightInKg}`);
        return parseFloat(weightInKg) < 20 ? Adjectives[index] : [];
      } else {
        return answer.trim().toLowerCase() === "yes" ? Adjectives[index] : [];
      }
    });
    return result;
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

// function generatePrompt(objectName: string) {
//   const adjectives = [
//     "touchable",
//     "container",
//     "supporter",
//     "visible",
//     "flammable",
//     "carryable",
//   ];

//   return `Which of the following things could be used to describe a ${objectName}: ${adjectives.join(
//     ","
//   )}?
//   List them like this "touchable,supporter,carryable".
//   `;
// }

// function generatePrompt(objectName: string) {
//   return `
// Object: a hammer
// - Can you place things on top of it? A: No
// - How much does it weight? A: 5kg
// - Can you place things inside it? A: No
// - Can you carry it? A: Yes
// - Is it solid? A: Yes
// - Can it move itself? A: No

// Object: a cloud
// - Can you place things on top of it? A: No
// - How much does it weight? A: 0kg
// - Can you place things inside it? A: No
// - Can you carry it? A: No
// - Is it solid? A: No
// - Can it move itself? A: Yes

// Object: a treasure chest
// - Can you place things on top of it? A: Yes
// - How much does it weight? A: 10kg
// - Can you place things inside it? A: Yes
// - Can you carry it? A: Yes
// - Is it solid? A: Yes
// - Can it move itself? A: No

// Object: a ${objectName}`;
// }

function generatePrompt(objectName: string) {
  return `
Make a table of object properties
object|Can you place things on top of it?|How much does it weigh?|Can you place things inside it?|Is it solid?|Does it have a brain?|Flammable?

a hammer|No|5kg|No|Yes|No|No
a cloud|No|0kg|No|No|No|No
a treasure chest|Yes|10kg|Yes|Yes|No|Yes
a goblin|No|50kg|No|Yes|Yes|No
the earth|No|5.972e24kg|No|No|No|No
${objectName}|`;
}
