import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { RootState } from "../../store";
import { useEffect } from "react";

import { Box, Container, Typography } from "@mui/material";
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
    (state: RootState) => state.postDetails
  );

  const user = useAppSelector((state) => {
    return state.user.userInfo;
  });

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

  const deleteCommentHandler =  (id: number) => {
     dispatch(deleteComment(id));
  };

  return (
    <Container maxWidth="sm">
      {error && (
        <Typography variant="h6" textAlign={"center"} color={"red"}>
          {error.message}
        </Typography>
      )}
      {post && (
        <Box>
          <Typography variant="h4" textAlign={"center"}>
            {post.title}
          </Typography>
          <Typography fontFamily={"monospace"} variant="h6">{`${moment(
            post.datetime
          ).format("MMM Do YYYY, h:mm a")} by ${
            post.user.username
          }`}</Typography>
          <Box
            mt={2}
            sx={{
              background: "#b84a8591",

              padding: "5px",
              borderRadius: 2,
            }}
            width={"100%"}
          >
            <Typography variant="h6" padding={1}>
              {post.description}
            </Typography>
          </Box>
        </Box>
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
        <Box>
          <CommentForm onSubmit={submitComment} />
        </Box>
      )}
    </Container>
  );
};

export default PostDetailsPage;
