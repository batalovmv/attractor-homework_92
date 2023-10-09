import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { RootState } from "../../store";
import { useEffect } from "react";

import { Box, Container, Typography } from "@mui/material";
import { fetchComments, fetchPost } from "../../features/post/postDetails";
import moment from "moment";

const PostDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { post, error } = useAppSelector(
    (state: RootState) => state.postDetails
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchPost(Number(id)));
      dispatch(fetchComments(Number(id)));
    }
  }, [dispatch, id]);

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
          <Typography variant="h6">{`${moment(post.datetime).format(
            "MMM Do YYYY, h:mm a"
          )} by ${post.user.username}`}</Typography>

          <Typography variant="h6" mt={3}>
            {post.description}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default PostDetailsPage;
