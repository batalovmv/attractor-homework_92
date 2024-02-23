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
    async getAllPosts(@CurrentUser() user?: User) {
        const currentUserId = user?.id || null;

        const posts = await PostRepository.createQueryBuilder("post")
            .leftJoinAndSelect("post.user", "user")
            .leftJoin("post.comments", "comments")
            .leftJoin("post.likes", "likes")
            .leftJoinAndSelect("likes.user", "likeUser")
            .addSelect("COUNT(DISTINCT comments.id)", "commentCount")
            .addSelect("COUNT(DISTINCT likes.id)", "likeCount")
            .addSelect("SUM(CASE WHEN likes.userId = :currentUserId THEN 1 ELSE 0 END)", "currentUserLiked")
            .groupBy("post.id")
            .addGroupBy("user.id")
            .orderBy("post.datetime", "DESC")
            .setParameter("currentUserId", currentUserId)
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
            commentCount: Number(post.commentCount),
            likeCount: Number(post.likeCount),
            currentUserLiked: currentUserId ? Number(post.currentUserLiked) > 0 : false
        }));
    }

    // Для getPost
    @Get('/:id')
    async getPost(@Param('id') postId: number, @CurrentUser() user?: User) {
        const currentUserId = user?.id || null;

        const post = await PostRepository.createQueryBuilder("post")
            .leftJoinAndSelect("post.user", "user")
            .leftJoin("post.comments", "comments")
            .leftJoin("post.likes", "likes")
            .addSelect(subQuery => {
                return subQuery
                    .select("COUNT(DISTINCT comments.id)", "commentCount")
                    .from("comment", "comments")
                    .where("comments.postId = post.id");
            }, "commentCount")
            .addSelect(subQuery => {
                return subQuery
                    .select("COUNT(DISTINCT likes.id)", "likeCount")
                    .from("like", "likes")
                    .where("likes.postId = post.id");
            }, "likeCount")
            .addSelect(subQuery => {
                return subQuery
                    .select("CASE WHEN COUNT(likeUser) > 0 THEN true ELSE false END", "currentUserLiked")
                    .from("like", "likeUser")
                    .where("likeUser.postId = post.id")
                    .andWhere("likeUser.userId = :currentUserId", { currentUserId });
            }, "currentUserLiked")
            .where("post.id = :id", { id: postId })
            .groupBy("post.id")
            .addGroupBy("user.id")
            .setParameter("currentUserId", currentUserId)
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
            commentCount: Number(post.commentCount),
            likeCount: Number(post.likeCount),
            currentUserLiked: Number(post.currentUserLiked) > 0,
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