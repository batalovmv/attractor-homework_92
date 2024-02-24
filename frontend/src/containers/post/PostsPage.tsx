import { Box, CircularProgress, Container, Pagination, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useEffect, useState } from "react";
import { deletePost, fetchPosts } from "../../features/post/postSlice";
import Post from "../../components/post/Post";
import { useNavigate } from "react-router-dom";

const PostsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
    const [postsPerPage] = useState(10);
    const { posts, pageCount, loading } = useAppSelector((state) => state.post);
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.userInfo);
    const authLoading = useAppSelector((state) => state.user.authLoading);

    const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
    };
    const navigate = useNavigate();
    useEffect(() => {
        if (!user && !authLoading) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);
    useEffect(() => {
        if (!authLoading) {
            dispatch(fetchPosts({ page: currentPage, perPage: postsPerPage }));
        }
    }, [currentPage, dispatch, authLoading, postsPerPage]);

  const deleteHandler = (id: number) => {
    dispatch(deletePost(id));
  };

    return (
        <Container maxWidth={"sm"}>
            <Typography textAlign={"center"} variant="h4" padding={4}>
                Posts
            </Typography>
            {authLoading || loading ? ( 
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    style={{ height: 'calc(100vh - 64px)' }}
                >
                    <CircularProgress />
                </Box>
            
            ) : (
                <>
                    {Array.isArray(posts) && posts.map((post) => (
                        <Post
                            key={post.id}
                            onDelete={() => deleteHandler(post.id)}
                            post={post}
                        />
                    ))}
                    <Pagination
                        count={pageCount}
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        shape="rounded"
                    />
                </>
            )}
        </Container>
    );
                    }
export default PostsPage;
