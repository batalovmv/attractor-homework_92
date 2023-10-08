import { Authorized, Body, CurrentUser, Delete, HttpError, JsonController, Param, Post, Req, Res } from "routing-controllers";
import { CreateBlogCommentDto } from "../dto/createBlogCommentDto";
import { UserRepository } from "../repositories/user.repository";
import { PostRepository } from "../repositories/post.repository";
import { CommentRepository } from "../repositories/blogComment.repository";
import { User } from "../entities/user.entity";

@JsonController('/comments')
export class BlogCommentController {
  @Post('/')
  @Authorized() // Только аутентифицированные пользователи могут создавать комментарии
  async create(@Body() commentData: CreateBlogCommentDto, @CurrentUser({ required: true }) user: User) {

    if (!user) throw new HttpError(401, "Unauthorized");

    const postId = Number(commentData.postId); 
    const post = await PostRepository.findOne({ where: { id: postId } });
    if (!post) throw new HttpError(404, "Post not found");

    const newComment = CommentRepository.create({
      text: commentData.text,
      user: user,
      post: post
    });
    await CommentRepository.save(newComment);

    return newComment;
  }

  @Delete('/:id')
  @Authorized() // Только аутентифицированные пользователи могут удалять комментарии
  async delete(@Param('id') commentId: number, @CurrentUser({ required: true }) user: User, @Res() response: any) {
    if (!user) throw new HttpError(401, "Unauthorized");

    const comment = await CommentRepository.findOne({ where: { id: commentId }, relations: ["user"] });
    if (!comment) throw new HttpError(404, "Comment not found");
    if (comment.user.id !== user.id) throw new HttpError(403, "Forbidden");

    await CommentRepository.delete(comment.id);
    return response.status(200).send({ message: "Post successfully deleted" });
  }
}