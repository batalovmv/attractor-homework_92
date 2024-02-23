import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  styled,
} from "@mui/material";
import { Comment as CommentIcon } from '@mui/icons-material';
import { IPost } from "../../interfaces/IPost";
import moment from "moment";
import { apiURL } from "../../constants";
import { Link } from "react-router-dom";
import { DeleteForever, ThumbUpAlt } from "@mui/icons-material";
import { MouseEventHandler, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { RootState } from "../../store";
import { likePost, unlikePost } from "../../features/like/likeSlice";

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
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((state: RootState) => state.likes);
    const [likeCount, setLikeCount] = useState(post.likeCount);
    const [currentUserLiked, setCurrentUserLiked] = useState(post.currentUserLiked);
    let cardImage: string | undefined = undefined;
    const currentUser = useAppSelector(
        (state: RootState) => state.user.userInfo?.username
    );

    if (post.image) {
        cardImage = apiURL + "/uploads/post_photos/" + post.image;
    }
    const handleLikeClick = async () => {
        if (loading) return;

        if (currentUserLiked) {
            await dispatch(unlikePost(post.id));
            setLikeCount(likeCount - 1); // уменьшаем количество лайков
            setCurrentUserLiked(false); // устанавливаем, что пользователь больше не лайкнул
        } else {
            await dispatch(likePost(post.id));
            setLikeCount(likeCount + 1); // увеличиваем количество лайков
            setCurrentUserLiked(true); // устанавливаем, что пользователь лайкнул
        }
    };
    const formattedDate = moment(post.datetime).format("LLL");
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
                            <Typography variant="h6">No image</Typography>
                        </Box>
                    )}
                    <Box display={"flex"} justifyContent={"space-between"} width={"100%"}>
                        <CardContent>
                            <Typography variant="h6">{formattedDate}</Typography>
                            <Typography
                                fontFamily={"monospace"}
                            >{`by ${post.user.username}`}</Typography>

                            <Typography
                                variant="h5"
                                component={StyledLink}
                                to={`/posts/${post.id}`}
                            >
                                {post.title}
                            </Typography>
                            <Box display={"flex"} alignItems={"center"} mt={2}>
                                <IconButton
                                    onClick={handleLikeClick}
                                    sx={{ color: currentUserLiked ? 'red' : 'inherit' }}
                                    disabled={loading}
                                >
                                    <ThumbUpAlt />
                                </IconButton>
                                <Typography variant="body2" sx={{ mr: 2 }}>
                                    {likeCount} Likes
                                </Typography>
                                {/* Обертка иконки комментария в StyledLink */}
                                <StyledLink to={`/posts/${post.id}`}>
                                    <CommentIcon sx={{ cursor: 'pointer', mr: 1 }} />
                                </StyledLink>
                                <Typography variant="body2">
                                    {post.commentCount} Comments
                                </Typography>
                            </Box>
                        </CardContent>

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