import { Paper, Typography } from "@mui/material";

import { useAppDispatch } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import { createPost } from "../../features/post/postSlice";
import PostForm from "../../components/post/PostForm";

const NewPost = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onPostSubmit = async (postData: FormData) => {
    await dispatch(createPost(postData));
    navigate("/");
  };

  return (
    <Paper sx={{ padding: 4 }}>
      <Typography variant="h4">New post</Typography>

      <PostForm onSubmit={onPostSubmit} />
    </Paper>
  );
};

export default NewPost;
