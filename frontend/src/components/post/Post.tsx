import {
  Box,
  Card,
  CardActions,
  CardMedia,
  IconButton,
  Typography,
  styled,
} from "@mui/material";
import { IPost } from "../../interfaces/IPost";
import moment from "moment";
import { apiURL } from "../../constants";
import { Link } from "react-router-dom";
import { DeleteForever } from "@mui/icons-material";
import { MouseEventHandler } from "react";
import { useAppSelector } from "../../store/hooks";
import { RootState } from "../../store";

interface Props {
  post: IPost;
  onDelete: MouseEventHandler<HTMLButtonElement>;
}

const StyledLink = styled(Link)(() => ({
  color: "pink",
  textDecoration: "none",
  ["&:hover"]: { color: "inherit" },
}));

const Post = ({ post, onDelete }: Props) => {
  let cardImage: string | undefined = undefined;
  const currentUser = useAppSelector(
    (state: RootState) => state.user.userInfo?.username
  );

  if (post.image) {
    cardImage = apiURL + "/uploads/post_photos/" + post.image;
  }

  return (
    <Box mb={4}>
      <Card elevation={1} sx={{ width: "100%" }}>
        <Box display={"flex"} gap={1}>
          {cardImage ? (
            <CardMedia
              sx={{ height: 200, width: 200 }}
              component="img"
              alt="post image"
              src={cardImage}
            />
          ) : (
            <Box sx={{ padding: 5, border: "1px solid #ccc" }}>
              <Typography variant="h6">Not image</Typography>
            </Box>
          )}
          <Box display={"flex"} justifyContent={"space-between"} width={"100%"}>
            <Box display={"flex"} flexDirection={"column"}>
              <Typography variant="h6">{`${moment(post.datetime).format(
                "MMM Do YYYY, h:mm a"
              )} `}</Typography>
              <Typography
                fontFamily={"monospace"}
              >{`by ${post.user.username}`}</Typography>

              <Typography
                variant="h6"
                component={StyledLink}
                to={`/posts/${post.id}`}
              >
                {post.title}
              </Typography>
            </Box>

            {currentUser && currentUser === post.user.username && (
              <CardActions>
                <IconButton onClick={onDelete}>
                  <DeleteForever />
                </IconButton>
              </CardActions>
            )}
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Post;
