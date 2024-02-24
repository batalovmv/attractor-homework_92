import {Alert, Container, Snackbar} from "@mui/material";
import "./App.css";
import AppToolbar from "./components/UI/AppToolbar/AppToolbar";
import { Route,Routes } from "react-router-dom";
import RegisterPage from "./containers/RegisterPage/RegisterPage";
import PostsPage from "./containers/post/PostsPage";
import PostDetailsPage from "./containers/post/PostDetailsPage";
import LoginPage from "./containers/LoginPage/LoginPage";
import NewPost from "./containers/post/NewPost";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { useAppSelector } from "./store/hooks";

import FullScreenModal from "./components/UI/MailModal/FullScreenModal";
import useCheckAuthState from "./components/UI/CheckAuth/useCheckAuthState";
import { SyntheticEvent, useEffect, useState } from "react";
import { RootState } from "./store";
const selectAllErrors = (state: RootState) => {
    const errors = [];
    if (state.user.error) errors.push(state.user.error);
    if (state.post.error) errors.push(state.post.error);
    if (state.postDetails.error) errors.push(state.postDetails.error);
    if (state.likes.error) errors.push(state.likes.error);
    return errors.length > 0 ? errors[0] : null;
};
function App() {
    const error = useAppSelector(selectAllErrors);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const user = useAppSelector((state) => state.user.userInfo);
    const emailSent = useAppSelector((state) => state.user.emailSent);
    const authLoading = useAppSelector((state) => state.user.authLoading);
    useCheckAuthState()
    useEffect(() => {
       
    }, [user, authLoading]);
    useEffect(() => {
        if (error) {
            setOpenSnackbar(true);
        }
    }, [error]);
    const handleCloseSnackbar = (event?: SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };
    const errorMessage = typeof error === 'string' ? error : error?.message || 'An unknown error occurred';
    return (
        <>
            <AppToolbar />
            <main>
                <Container maxWidth="xl">
                    <Routes>
                        <Route path="/" element={<PostsPage />} />
                        <Route path="/posts/:id" element={<PostDetailsPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route
                            path="/add-post"
                            element={
                                <ProtectedRoute
                                    isAllowed={!!user && !authLoading}
                                    redirectPath="/login"
                                >
                                    <NewPost />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Container>
            </main>
            <FullScreenModal open={emailSent} />
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {errorMessage}
                </Alert>
            </Snackbar>
</>
    );
}

export default App;

