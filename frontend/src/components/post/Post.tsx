import { Box, Card, CardMedia, Typography, styled } from "@mui/material";
import { IPost } from "../../interfaces/IPost";
import moment from "moment";
import { apiURL } from "../../constants";
import { Link } from "react-router-dom";

interface Props {
  post: IPost;
}

const StyledLink = styled(Link)(() => ({
  color: "pink",
  textDecoration: "none",
  ["&:hover"]: { color: "inherit" },
}));

const Post = ({ post }: Props) => {
  let cardImage: string = "img";

  if (post.image) {
    cardImage = apiURL + "/uploads/" + post.image;
  }

  return (
    <Card elevation={10}>
      <Box display={"flex"} gap={1}>
        <CardMedia component="img" alt={post.title} src={cardImage} />

        <Box display={"flex"} flexDirection={"column"}>
          <Typography variant="h6">{`${moment(post.datetime).format(
            "MMM Do YYYY, h:mm a"
          )}`}</Typography>

          <Typography
            variant="h6"
            component={StyledLink}
            to={`/posts/${post.id}`}
          >
            {post.title}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default Post;
