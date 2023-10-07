export interface IPost {
  id: number;
  title: string;
  description: string;
  image: string;
  datetime: Date;
  comments: IComment[];
}
