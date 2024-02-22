import { Authorized, Body, CurrentUser, Delete, Get, HttpError, JsonController, Param, Post, Req, Res, UseBefore } from "routing-controllers";
import { CreatePostDto } from "../dto/createPostDto";
import { UserRepository } from "../repositories/user.repository";
import { PostRepository } from "../repositories/post.repository";
import { request } from "express";
import { MulterUpload } from "../multer/uploadPostPhoto";
import { User } from "../entities/user.entity";
import { CommentRepository } from "../repositories/blogComment.repository";

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
    async create(@Req() req: any, @CurrentUser({ required: true }) user: User, @Res() response: any) {
        if (!user) throw new HttpError(401, "Unauthorized");

        try {
            const postData: CreatePostDto = req.body;

            if (req.file) {
                postData.image = req.file.filename;
            }

            const newPost = PostRepository.create({
                ...postData,
                user: user
            });
            await PostRepository.save(newPost);
            response.status(201).json(newPost);
        } catch (error) {
            console.error('An error occurred:', error);
            response.status(500).json({ message: 'An error occurred while creating the post.' });
        }
    }

    @Delete('/:id')
    @Authorized()
    async delete(@Param('id') commentId: number, @CurrentUser({ required: true }) user: User, @Res() response: any) {
        if (!user) throw new HttpError(401, "Unauthorized");

        const comment = await CommentRepository.findOne({ where: { id: commentId }, relations: ["user"] });
        if (!comment) throw new HttpError(404, "Comment not found");
        if (comment.user.id !== user.id) throw new HttpError(403, "Forbidden");

        await CommentRepository.delete(comment.id);
        response.status(200).send({ message: "Post successfully deleted" });
    }

}