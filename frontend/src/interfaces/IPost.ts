import { IComment } from "./IComment";
import { IUser } from "./IUser";

export interface IPost {
  id: number;
  title: string;
  description: string;
  image: string;
  datetime: Date;
  comments: IComment[];
  user: IUser;
}
