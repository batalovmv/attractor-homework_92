import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Modal,
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
    const [modalOpen, setModalOpen] = useState(false);
    const [isLikeInProgress, setIsLikeInProgress] = useState(false);
    const [currentUserLiked, setCurrentUserLiked] = useState(post.currentUserLiked);
    let cardImage: string | undefined = undefined;
    const currentUser = useAppSelector(
        (state: RootState) => state.user.userInfo?.username
    );

    if (post.image) {
        cardImage = apiURL + "/uploads/post_photos/" + post.image;
    }
    const handleLikeClick = async () => {
        if (isLikeInProgress) return;

        setIsLikeInProgress(true);
        try {
            if (currentUserLiked) {
                await dispatch(unlikePost(post.id));
                setLikeCount(likeCount - 1);
                setCurrentUserLiked(false);
            } else {
                await dispatch(likePost(post.id));
                setLikeCount(likeCount + 1);
                setCurrentUserLiked(true);
            }
        } catch (error) {
            
        } finally {
            setIsLikeInProgress(false);
        }
    };
    const handleDeleteClick = () => {
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleConfirmDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        onDelete(event);
        setModalOpen(false);
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
                            onClick={handleDeleteClick}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                color: 'white',
                                backgroundColor: theme.palette.grey[800],
                                '&:hover': {
                                    backgroundColor: theme.palette.grey[700],
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
                <Modal
                    open={modalOpen}
                    onClose={handleCloseModal}
                    aria-labelledby="delete-confirmation-modal"
                    aria-describedby="confirm-delete-post"
                >
                    <Box sx={{
                        position: 'absolute' as 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        borderRadius: 1
                    }}>
                        <Typography id="delete-confirmation-modal" variant="h6" component="h2">
                            Are you sure you want to delete this post?
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Button onClick={handleCloseModal} color="secondary">
                                Cancel
                            </Button>
                            <Button onClick={handleConfirmDelete} color="error">
                                Delete
                            </Button>
                        </Box>
                    </Box>
                </Modal>
            </Card>
        </Box>
    );
};

export default Post;
