import { IsString } from "class-validator";

export class CreateBlogCommentDto {
  @IsString()
  text!: string;

  @IsString()
  postId!: number;
}