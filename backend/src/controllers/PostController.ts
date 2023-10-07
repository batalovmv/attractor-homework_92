import { Authorized, Body, CurrentUser, Delete, HttpError, JsonController, Param, Post, Req, UseBefore } from "routing-controllers";
import { CreatePostDto } from "../dto/createPostDto";
import { UserRepository } from "../repositories/user.repository";
import { PostRepository } from "../repositories/post.repository";
import { request } from "express";
import { MulterUpload } from "../multer/uploadPostPhoto";
import { User } from "../entities/user.entity";

@JsonController('/posts')
export class PostController {

  @Post('/')
  @UseBefore(MulterUpload)
  @Authorized()
  async create(@Req() req: any, @CurrentUser({ required: true }) user: User) {
    const postData: CreatePostDto = req.body;

    if (!user) throw new HttpError(401, "Unauthorized");

    if (req.file) {
      postData.image = req.file.filename;
    }

    const newPost = PostRepository.create({
      ...postData,
      user: user
    });
    await PostRepository.save(newPost);

    return newPost;
  }

  @Delete('/:id')
  @Authorized() // Только аутентифицированные пользователи могут удалять посты
  async delete(@Param('id') postId: number, @CurrentUser({ required: true }) user: User) {
    if (!user) throw new HttpError(401, "Unauthorized");

    const post = await PostRepository.findOne({ where: { id: postId }, relations: ["user"] });
    if (!post) throw new HttpError(404, "Post not found");
    if (post.user.id !== user.id) throw new HttpError(403, "Forbidden");

    await PostRepository.remove(post);
  }
}