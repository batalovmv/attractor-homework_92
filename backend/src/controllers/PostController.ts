import { Authorized, Body, CurrentUser, Delete, Get, HttpError, JsonController, Param, Post, QueryParam, Req, Res, UseBefore } from "routing-controllers";
import { CreatePostDto } from "../dto/createPostDto";
import { UserRepository } from "../repositories/user.repository";
import { PostRepository } from "../repositories/post.repository";
import { request } from "express";
import { MulterUpload } from "../multer/uploadPostPhoto";
import { User } from "../entities/user.entity";
import { CommentRepository } from "../repositories/blogComment.repository";
import { Like } from "../entities/like.entity";
import { BlogComment } from "../entities/blogComment.entity";

@JsonController('/posts')
export class PostController {
    @Get('/')
    async getAllPosts(
        @CurrentUser({ required: true }) user: User,
        @QueryParam('page') page: number = 1,
        @QueryParam('limit') limit: number = 10) {
        const currentUserId = user?.id || null;
        const [result, total] = await PostRepository.createQueryBuilder("post")
            .leftJoinAndSelect("post.user", "user")
            // ... (остальные join)
            .orderBy("post.datetime", "DESC")
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        const posts = await PostRepository.createQueryBuilder("post")
            .leftJoinAndSelect("post.user", "user")
            .loadRelationCountAndMap("post.commentCount", "post.comments")
            .loadRelationCountAndMap("post.likeCount", "post.likes")
            .addSelect(subQuery => {
                return subQuery
                    .select("COUNT(like.id) > 0", "liked")
                    .from(Like, "like")
                    .where("like.postId = post.id")
                    .andWhere("like.userId = :currentUserId", { currentUserId })
                    .groupBy("like.postId");
            }, "post_liked")
            .orderBy("post.datetime", "DESC")
            .getRawAndEntities();

        const { entities, raw } = posts;

        entities.forEach((post, index) => {
            post.currentUserLiked = Boolean(raw[index].post_liked);
            post.commentCount = raw[index].post_commentCount; 
            post.likeCount = raw[index].post_likeCount; 
        });
        const dataWithLikesAndCounts = result.map((post) => {
            const postRaw = raw.find(rawPost => rawPost.post_id === post.id);
            return {
                ...post,
                currentUserLiked: Boolean(postRaw?.post_liked),
                commentCount: postRaw?.post_commentCount, 
                likeCount: postRaw?.post_likeCount 
            };
        });
        return {
            data: dataWithLikesAndCounts,
            count: total,
            currentPage: page,
            lastPage: Math.ceil(total / limit)
        };
       
    }

    @Get('/:id')
    async getPost(@Param('id') postId: number, @CurrentUser() user?: User) { // Также делаем user опциональным
        const currentUserId = user?.id || null;

        const post = await PostRepository.createQueryBuilder("post")
            .leftJoinAndSelect("post.user", "user")
            .leftJoin("post.comments", "comments")
            .leftJoin("post.likes", "likes")
            .leftJoinAndSelect("likes.user", "likeUser", "likeUser.id = :currentUserId", { currentUserId })
            .select([
                "post",
                "user.id",
                "user.username",
                "COUNT(DISTINCT comments.id) AS commentCount",
                "COUNT(DISTINCT likes.id) AS likeCount",
                "SUM(CASE WHEN likeUser.id = :currentUserId THEN 1 ELSE 0 END) AS currentUserLiked"
            ])
            .where("post.id = :id", { id: postId })
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