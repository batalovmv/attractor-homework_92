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
        const currentUserId = user?.id || 0; // Если пользователь не авторизован, используем 0

        const posts = await PostRepository.createQueryBuilder('post')
            .leftJoin('post.comments', 'comment') // Присоединяем комментарии
            .leftJoin('post.likes', 'like') // Присоединяем лайки
            .loadRelationCountAndMap('post.commentCount', 'post.comments') // Подсчитываем количество комментариев
            .loadRelationCountAndMap('post.likeCount', 'post.likes') // Подсчитываем количество лайков
            .leftJoin('like.user', 'likeUser') // Присоединяем пользователей, которые лайкнули посты
            .addSelect(subQuery => {
                return subQuery
                    .select('COUNT(likeUser.id)', 'liked')
                    .from('like', 'like')
                    .where('like.postId = post.id')
                    .andWhere('like.userId = :currentUserId', { currentUserId });
            }, 'currentUserLiked')
            .groupBy('post.id') // Группируем результаты по ID поста
            .addGroupBy('user.id') // Группируем результаты по ID пользователя
            .orderBy('post.datetime', 'DESC') // Сортируем посты по дате
            .getRawAndEntities(); // Получаем сущности и "сырые" данные

        // Преобразуем результаты в желаемый формат
        const result = posts.entities.map(post => {
            const raw = posts.raw.find(r => r.post_id === post.id);
            return {
                id: post.id,
                title: post.title,
                description: post.description,
                image: post.image,
                datetime: post.datetime,
                user: {
                    id: post.user.id,
                    username: post.user.username
                },
                commentCount: raw.post_commentCount,
                likeCount: raw.post_likeCount,
                currentUserLiked: raw.currentUserLiked > 0 // Проверяем, был ли лайк от текущего пользователя
            };
        });

        return result;
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