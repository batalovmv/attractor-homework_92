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

        // Подзапрос для подсчёта количества комментариев
        const commentCountSubQuery = PostRepository.createQueryBuilder('p')
            .leftJoin('p.comments', 'comment')
            .select('p.id', 'postId')
            .addSelect('COUNT(comment.id)', 'count')
            .groupBy('p.id');

        // Подзапрос для подсчёта количества лайков
        const likeCountSubQuery = PostRepository.createQueryBuilder('p')
            .leftJoin('p.likes', 'like')
            .select('p.id', 'postId')
            .addSelect('COUNT(like.id)', 'count')
            .groupBy('p.id');

        // Подзапрос для проверки, лайкал ли текущий пользователь пост
        const currentUserLikedSubQuery = PostRepository.createQueryBuilder('p')
            .leftJoin('p.likes', 'liked')
            .select('p.id', 'postId')
            .addSelect('COUNT(liked.id)', 'count')
            .where('liked.user.id = :currentUserId', { currentUserId })
            .groupBy('p.id');

        // Основной запрос, соединяющий все подзапросы
        const posts = await PostRepository.createQueryBuilder('post')
            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndMapOne('post.commentCount', `(${commentCountSubQuery.getQuery()})`, 'commentCount', 'post.id = commentCount.postId')
            .leftJoinAndMapOne('post.likeCount', `(${likeCountSubQuery.getQuery()})`, 'likeCount', 'post.id = likeCount.postId')
            .leftJoinAndMapOne('post.currentUserLiked', `(${currentUserLikedSubQuery.getQuery()})`, 'currentUserLiked', 'post.id = currentUserLiked.postId')
            .select([
                'post',
                'user.id',
                'user.username',
                'commentCount.count',
                'likeCount.count',
                'currentUserLiked.count',
            ])
            .setParameters({ currentUserId })
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
            commentCount: Number(post.commentCount_count),
            likeCount: Number(post.likeCount_count),
            currentUserLiked: Number(post.currentUserLiked_count) > 0
        }));
    }

    @Get('/:id')
    async getPost(@Param('id') postId: number, @CurrentUser() user?: User) {
        const currentUserId = user?.id || null;

        const post = await PostRepository.createQueryBuilder("post")
            .leftJoinAndSelect("post.user", "user")
            .leftJoin("post.comments", "comments")
            .leftJoin("post.likes", "likes")
            .leftJoin("likes.user", "likeUser")
            .select([
                "post",
                "user.id",
                "user.username",
                "COUNT(DISTINCT comments.id) AS commentCount",
                "COUNT(DISTINCT likes.id) AS likeCount",
                "COUNT(likeUser.id) AS currentUserLiked"
            ])
            .where("post.id = :id AND (likeUser.id = :currentUserId OR likeUser.id IS NULL)", { id: postId, currentUserId })
            .groupBy("post.id")
            .addGroupBy("user.id")
            .addGroupBy("user.username")
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
            currentUserLiked: currentUserId ? post.currentUserLiked > 0 : false
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