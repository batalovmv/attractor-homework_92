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
            .leftJoin("post.likes", "likes") // Добавляем левое соединение с таблицей likes
            .select([
                "post",
                "user.id",
                "user.username",
                "COUNT(DISTINCT comments.id) AS commentCount", // Используйте DISTINCT, чтобы избежать дублирования при подсчете
                "COUNT(DISTINCT likes.id) AS likeCount" // Подсчет количества лайков
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
            commentCount: post.commentCount,
            likeCount: post.likeCount // Включаем количество лайков в ответ
        }));
    }

    @Get('/:id')
    async getPost(@Param('id') postId: number) {
        const post = await PostRepository.createQueryBuilder("post")
            .leftJoinAndSelect("post.user", "user")
            .leftJoin("post.comments", "comments")
            .leftJoin("post.likes", "likes") // Добавляем левое соединение с таблицей likes
            .select([
                "post",
                "user.id",
                "user.username",
                "COUNT(DISTINCT comments.id) AS commentCount", // Используйте DISTINCT для подсчета комментариев
                "COUNT(DISTINCT likes.id) AS likeCount" // Подсчет количества лайков
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
            commentCount: post.commentCount,
            likeCount: post.likeCount // Включаем количество лайков в ответ
        };
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
    async delete(@Param('id') commentId: number, @CurrentUser({ required: true }) user: User) {
        if (!user) throw new HttpError(401, "Unauthorized");

        const comment = await CommentRepository.findOne({ where: { id: commentId }, relations: ["user"] });
        if (!comment) throw new HttpError(404, "Comment not found");
        if (comment.user.id !== user.id) throw new HttpError(403, "Forbidden");

        await CommentRepository.delete(comment.id);

        // Возвращаем объект, который будет преобразован в HTTP-ответ со статусом 200
        return { message: "Comment successfully deleted" };
    }

}