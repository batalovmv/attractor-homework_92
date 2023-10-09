import { Authorized, Body, CurrentUser, Delete, Get, HttpError, JsonController, Param, Post, Req, Res, UseBefore } from "routing-controllers";
import { CreatePostDto } from "../dto/createPostDto";
import { UserRepository } from "../repositories/user.repository";
import { PostRepository } from "../repositories/post.repository";
import { request } from "express";
import { MulterUpload } from "../multer/uploadPostPhoto";
import { User } from "../entities/user.entity";

@JsonController('/posts')
export class PostController {

  @Get('/')
  async getAllPosts() {
    const posts = await PostRepository.createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoin("post.comments", "comments")
      .select([
        "post",
        "user.id",
        "user.username",
        "COUNT(comments.id) AS commentCount"
      ])
      .groupBy("post.id")
      .addGroupBy("user.id")
      .addGroupBy("user.username")
      .orderBy("post.datetime", "DESC")
      .getRawMany();

    return posts.map(post => ({
      id: post.post_id,
      title: post.post_title,
      description: post.post_description,
      image: post.post_image,
      datetime: post.post_datetime,
      user: {
        id: post.user_id,
        username: post.user_username,
      },
      commentCount: post.commentCount
    }));
  }

  @Get('/:id')
  async getPost(@Param('id') postId: number) {
    const post = await PostRepository.createQueryBuilder("post")
      .leftJoinAndSelect("post.user", "user")
      .leftJoin("post.comments", "comments")
      .select([
        "post",
        "user.id",
        "user.username",
        "COUNT(comments.id) AS commentCount"
      ])
      .where("post.id = :id", { id: postId })
      .groupBy("post.id")
      .addGroupBy("user.id")
      .addGroupBy("user.username")
      .getRawOne();

    if (!post) throw new HttpError(404, "Post not found");

    return {
      id: post.post_id,
      title: post.post_title,
      description: post.post_description,
      image: post.post_image,
      datetime: post.post_datetime,
      user: {
        id: post.user_id,
        username: post.user_username,
      },
      commentCount: post.commentCount
    };
  }

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
  @Authorized() 
  async delete(@Param('id') postId: number, @CurrentUser({ required: true }) user: User, @Res() response: any) {
    if (!user) throw new HttpError(401, "Unauthorized");

    const post = await PostRepository.findOne({ where: { id: postId }, relations: ["user"] });
    if (!post) throw new HttpError(404, "Post not found");
    if (post.user.id !== user.id) throw new HttpError(403, "Forbidden");

    await PostRepository.remove(post);

    return response.status(200).send({ message: "Post successfully deleted" });
  }
}