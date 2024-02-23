import { Authorized, Body, CurrentUser, Delete, Get, HttpError, JsonController, Param, Post, Req, Res, UseBefore } from "routing-controllers";
import { CreatePostDto } from "../dto/createPostDto";
import { UserRepository } from "../repositories/user.repository";
import { PostRepository } from "../repositories/post.repository";
import { request } from "express";
import { MulterUpload } from "../multer/uploadPostPhoto";
import { User } from "../entities/user.entity";
import { CommentRepository } from "../repositories/blogComment.repository";
import { Like } from "../entities/like.entity";
import { BlogComment } from "../entities/blogComment.entity";
import { getRepository } from "typeorm";

@JsonController('/posts')
export class PostController {
    @Get('/')
    async getAllPosts(@CurrentUser({ required: true }) user: User) {
        const currentUserId = user.id;

        const posts = await getRepository(Post)
            .createQueryBuilder("post")
            .leftJoinAndSelect("post.user", "user")
            .loadRelationCountAndMap("post.commentCount", "post.comments")
            .loadRelationCountAndMap("post.likeCount", "post.likes")
            .leftJoin("post.likes", "likes")
            .addSelect("COUNT(likes.id) FILTER (WHERE likes.userId = :currentUserId) > 0", "post_currentUserLiked")
            .groupBy("post.id")
            .setParameter("currentUserId", currentUserId)
            .orderBy("post.datetime", "DESC")
            .getMany();

        // Приведение post_currentUserLiked к булевому значению
        posts.forEach(post => {
            post.currentUserLiked = Boolean(post.currentUserLiked);
        });

        return posts;
    }

    @Get('/:id')
    async getPost(@Param('id') postId: number, @CurrentUser() user?: User) {
        const currentUserId = user?.id;

        const post = await getRepository(Post)
            .createQueryBuilder("post")
            .leftJoinAndSelect("post.user", "user")
            .leftJoinAndSelect("post.comments", "comments")
            .leftJoinAndSelect("post.likes", "likes")
            .loadRelationCountAndMap("post.commentCount", "post.comments")
            .loadRelationCountAndMap("post.likeCount", "post.likes")
            .leftJoin("post.likes", "likes")
            .addSelect("COUNT(likes.id) FILTER (WHERE likes.userId = :currentUserId) > 0", "post_currentUserLiked")
            .where("post.id = :id", { id: postId })
            .setParameter("currentUserId", currentUserId)
            .groupBy("post.id")
            .getOne();

        if (!post) {
            throw new HttpError(404, "Пост не найден");
        }

        // Приведение post_currentUserLiked к булевому значению
        post.currentUserLiked = Boolean(post.currentUserLiked);

        return post;
    }  

    @Post('/')
    @UseBefore(MulterUpload)
    @Authorized()
    async create(@Req() req: any, @CurrentUser({ required: true }) user: User) {
        if (!user) throw new HttpError(401, "Unauthorized");

        const postData: CreatePostDto = req.body;

        if (req.file) {
            postData.image = req.file.filename;
        }

        const newPost = PostRepository.create({
            ...postData,
            user: user
        });

        await PostRepository.save(newPost);

        // Просто возвращаем новый пост, это будет автоматически преобразовано в HTTP 201
        return newPost;
    }

    @Delete('/:id')
    @Authorized()
    async delete(@Param('id') postId: number, @CurrentUser({ required: true }) user: User) {
        if (!user) throw new HttpError(401, "Unauthorized");

        const post = await PostRepository.findOne({
            where: { id: postId },
            relations: ["user"]
        });
        if (!post) throw new HttpError(404, "Post not found");
        if (post.user.id !== user.id) throw new HttpError(403, "Forbidden");

        await PostRepository.delete(post.id);

        
        return { message: "Post successfully deleted" };
    }

}