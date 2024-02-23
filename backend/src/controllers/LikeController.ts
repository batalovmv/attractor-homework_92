import { Authorized, CurrentUser, Delete, HttpError, JsonController, Param, Post } from "routing-controllers";
import { PostRepository } from "../repositories/post.repository";
import { User } from "../entities/user.entity";
import { Like } from "../entities/like.entity";
import { LikeRepository } from "../repositories/like.repository";
import { CommentRepository } from "../repositories/blogComment.repository";

@JsonController('/likes')
export class LikeController {
    @Post('/post/:postId')
    @Authorized()
    async likePost(@Param('postId') postId: number, @CurrentUser({ required: true }) user: User) {
        const post = await PostRepository.findOne({ where: { id: postId } });
        if (!post) throw new HttpError(404, 'Post not found');

        // Проверка, лайкал ли уже пользователь этот пост
        const existingLike = await LikeRepository.findOne({
            where: {
                user: { id: user.id },
                post: { id: postId }
            }
        });
        if (existingLike) throw new HttpError(400, 'Already liked');

        const like = new Like();
        like.post = post;
        like.user = user;
        await LikeRepository.save(like);

        return { message: 'Liked successfully', user: user, existingLike:'existingLike' };
    }

    @Delete('/post/:postId')
    @Authorized()
    async unlikePost(@Param('postId') postId: number, @CurrentUser({ required: true }) user: User) {
        const like = await LikeRepository.findOne({
            where: {
                user: { id: user.id },
                post: { id: postId }
            }
        });

        if (!like) throw new HttpError(404, 'Like not found');

        await LikeRepository.remove(like);

        return { message: 'Unliked successfully' };
    }

    // Добавление лайка к комментарию
    @Post('/comment/:commentId')
    @Authorized()
    async likeComment(@Param('commentId') commentId: number, @CurrentUser({ required: true }) user: User) {
        const comment = await CommentRepository.findOne({ where: { id: commentId } });
        if (!comment) throw new HttpError(404, 'Comment not found');

        const existingLike = await LikeRepository.findOne({
            where: {
                user: { id: user.id },
                comment: { id: commentId }
            }
        });

        if (existingLike) throw new HttpError(400, 'Already liked');

        const like = new Like();
        like.comment = comment;
        like.user = user;
        await LikeRepository.save(like);

        return { message: 'Liked successfully' };
    }

    @Delete('/comment/:commentId')
    @Authorized()
    async unlikeComment(@Param('commentId') commentId: number, @CurrentUser({ required: true }) user: User) {
        const like = await LikeRepository.findOne({
            where: {
                user: { id: user.id },
                comment: { id: commentId }
            }
        });

        if (!like) throw new HttpError(404, 'Like not found');

        await LikeRepository.remove(like);

        return { message: 'Unliked successfully' };
    }
}