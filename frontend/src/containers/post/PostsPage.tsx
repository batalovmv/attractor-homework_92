import { Container, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { RootState } from "../../store";
import { useEffect } from "react";
import { deletePost, fetchPosts } from "../../features/post/postSlice";
import Post from "../../components/post/Post";

const PostsPage = () => {
  const { posts, error } = useAppSelector((state: RootState) => state.post);
  const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.userInfo);
    const authLoading = useAppSelector((state) => state.user.authLoading);
  useEffect(() => {
    dispatch(fetchPosts());
  }, [user, authLoading]);

   

  const deleteHandler = (id: number) => {
    dispatch(deletePost(id));
  };

  return (
    <Container maxWidth={"sm"}>
      <Typography textAlign={"center"} variant="h4" padding={4}>
        Posts
      </Typography>
      {error && (
        <Typography textAlign={"center"} color={"red"}>
          {error.message}
        </Typography>
      )}
          {Array.isArray(posts) && posts.map((post) => (
              <Post
                  key={post.id}
                  onDelete={() => deleteHandler(post.id)}
                  post={post}
              />
          ))}
    </Container>
  );
};

export default PostsPage;
