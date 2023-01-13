import { Thing } from "../../core/things";

let NextId: number = 1;

type Renderable = {
  id: number;
  name: string;
  imageURL: string;
};

export function addObject(name: string, thing: Thing) {
  // grab an image from Google based on the name
  const inputElement = document.querySelector("#image-search input");

  // add this to the images in the top panel
}
