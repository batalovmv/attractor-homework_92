import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useEffect, useState } from "react";

import { Box, Button, Container, Paper, Typography } from "@mui/material";
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
    const [expanded, setExpanded] = useState(false);
    const maxDescriptionLength = 100;
    const { id } = useParams<{ id: string }>();
    const dispatch = useAppDispatch();

    const { post, comments } = useAppSelector(
        (state) => state.postDetails
    );

    const user = useAppSelector((state) => state.user.userInfo);
    const toggleExpanded = () => {
        setExpanded(!expanded);
    };
    const renderDate = (datetime:Date) => {
        return moment(datetime).format('LL'); // 'LL' формат даты - September 4, 1986
    };
    const renderDescription = (description:string) => {
        if (expanded || description.length <= maxDescriptionLength) {
            return description;
        }
        return `${description.substring(0, maxDescriptionLength)}...`;
    };
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
            {post && (
                <Paper elevation={3} sx={{ p: 2, my: 2, position: 'relative' }}>
                    <Typography variant="h4" textAlign="center" gutterBottom>
                        {post.title}
                    </Typography>
                    <Typography variant="body1" sx={{ wordWrap: 'break-word', mt: 1 }}>
                        {renderDescription(post.description)}
                        {post.description.length > maxDescriptionLength && (
                            <Button onClick={toggleExpanded}>
                                {expanded ? 'Show Less' : 'Show More'}
                            </Button>
                        )}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mt: 2 }} color="text.secondary">
                        {renderDate(post.datetime)} by {post.user.username}
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