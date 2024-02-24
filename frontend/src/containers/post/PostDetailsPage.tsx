import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { RootState } from "../../store";
import { useEffect } from "react";

import { Box, Container, Paper, Typography } from "@mui/material";
import {
  createComment,
  deleteComment,
  fetchComments,
  fetchPost,
} from "../../features/post/postDetailsSlice";
import moment from "moment";
import CommentItem from "../../components/comments/CommentItem";
import CommentForm from "../../components/comments/CommentForm";

const PostDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();

    const { post, error, comments } = useAppSelector(
        (state) => state.postDetails
    );

    const user = useAppSelector((state) => state.user.userInfo);

    useEffect(() => {
        if (id) {
            dispatch(fetchPost(Number(id)));
            dispatch(fetchComments(Number(id)));
        }
    }, [dispatch, id]);

    const submitComment = async (text: string, postId: number) => {
        const comment = {
            text: text,
            postId: postId,
        };
        await dispatch(createComment(comment));
        dispatch(fetchComments(Number(id)));
    };

    const deleteCommentHandler = (id: number) => {
        dispatch(deleteComment(id));
    };

    return (
        <Container maxWidth="sm">
            {error && (
                <Typography variant="h6" textAlign="center" color="error">
                    {error.message}
                </Typography>
            )}
            {post && (
                <Paper elevation={3} sx={{ p: 2, my: 2 }}>
                    <Typography variant="h4" textAlign="center" gutterBottom>
                        {post.title}
                    </Typography>
                    <Typography variant="subtitle1" textAlign="center" color="text.secondary">
                        {moment(post.datetime).format('MMMM Do YYYY, h:mm a')} by {post.user.username}
                    </Typography>
                    <Typography variant="body1" sx={{ wordWrap: 'break-word', mt: 1 }}>
                        {post.description}
                    </Typography>
                </Paper>
            )}
            <Box mt={3}>
                <Typography variant="h6">Comments:</Typography>
                {comments?.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        onDelete={() => deleteCommentHandler(comment.id)}
                    />
                ))}
            </Box>

            {user && (
                <Box mt={2}>
                    <CommentForm onSubmit={submitComment} />
                </Box>
            )}
        </Container>
    );
};

export default PostDetailsPage;