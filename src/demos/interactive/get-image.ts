import fs from "fs";
import { Configuration, OpenAIApi } from "openai";
import path from "path";
import { encode, decode } from "node-base64-image";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Make sure the client is loaded before calling this method.
export default async function (keyword: string, localFilesPath: string) {
  const localImageDirectory = path.join(localFilesPath, "images");

  try {
    await fs.promises.access(
      path.join(localImageDirectory, `${keyword}.png`),
      fs.constants.O_RDONLY
    );
  } catch {
    console.log("Asking OpenAI to generate a suitable image...");
    const response = await openai.createImage({
      prompt: `pixellised icon of a ${keyword}`,
      n: 1,
      size: "256x256",
    });
    if (response.data.data[0].url) {
      // this URL will not last long (OpenAI are hosting it) and we don't want
      // to generate it repeatedly
      try {
        await fs.promises.mkdir(localImageDirectory);
      } catch {}
      const image = await encode(response.data.data[0].url);
      await decode(image, {
        fname: path.join(localFilesPath, "images", `${keyword}`),
        ext: "png",
      });
    }
  }
}
