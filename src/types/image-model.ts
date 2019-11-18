import { AnyObj } from "./index";
import Store from "../helpers/store";

export default interface IImageModel {}

export type ImageModelProps = {
  imageUrl: string;
  store: Store;
};
