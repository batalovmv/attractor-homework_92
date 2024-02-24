import {
  Box,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {  CommentOutlined, DeleteOutline, ThumbUpAltOutlined } from '@mui/icons-material';
import { IPost } from "../../interfaces/IPost";
import moment from "moment";
import { apiURL } from "../../constants";
import { Link } from "react-router-dom";
import { MouseEventHandler, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { RootState } from "../../store";
import { likePost, unlikePost } from "../../features/like/likeSlice";

interface Props {
    post: IPost;
    onDelete: MouseEventHandler<HTMLButtonElement>;
}



const Post = ({ post, onDelete }: Props) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
        <Box mb={4} sx={{ width: '100%' }}>
            <Card elevation={1}>
                <Box position="relative">
                    {cardImage && (
                        <CardMedia
                            sx={{ height: isMobile ? 140 : 200, width: '100%' }}
                            component="img"
                            alt="post image"
                            src={cardImage}
                        />
                    )}
                    {currentUser && currentUser === post.user.username && (
                        <IconButton
                            onClick={onDelete}
                            sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                color: theme.palette.grey[500],
                                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                }
                            }}
                            size="large"
                        >
                            <DeleteOutline />
                        </IconButton>
                    )}
                </Box>
                <CardContent>
                    <Typography variant="subtitle1" color="textSecondary">
                        {formattedDate}
                    </Typography>
                    <Typography variant="body2">{`by ${post.user.username}`}</Typography>
                    <Link to={`/posts/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <Typography variant="h6" component="h2" sx={{ mt: 2, mb: 2 }}>
                            {post.title}
                        </Typography>
                    </Link>
                    <Box display="flex" alignItems="center" mb={2}>
                        <IconButton
                            onClick={handleLikeClick}
                            sx={{ color: currentUserLiked ? theme.palette.primary.main : 'inherit' }}
                            disabled={loading}
                            size="large"
                        >
                            <ThumbUpAltOutlined />
                        </IconButton>
                        <Typography variant="body2" sx={{ mr: 2 }}>
                            {likeCount} Likes
                        </Typography>
                        <Link to={`/posts/${post.id}`} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
                            <CommentOutlined sx={{ mr: 1 }} />
                            <Typography variant="body2">
                                {post.commentCount} Comments
                            </Typography>
                        </Link>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Post;
