import { IsNumber, IsString } from "class-validator";

export class CreateBlogCommentDto {
  @IsString()
  text!: string;

  @IsNumber()
  postId!: number;
}