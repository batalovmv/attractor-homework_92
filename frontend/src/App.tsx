import {Container} from "@mui/material";
import "./App.css";
import AppToolbar from "./components/UI/AppToolbar/AppToolbar";
import { HashRouter, Route,Routes } from "react-router-dom";
import RegisterPage from "./containers/RegisterPage/RegisterPage";
import PostsPage from "./containers/post/PostsPage";
import PostDetailsPage from "./containers/post/PostDetailsPage";
import LoginPage from "./containers/LoginPage/LoginPage";
import NewPost from "./containers/post/NewPost";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { useAppSelector } from "./store/hooks";

import FullScreenModal from "./components/UI/MailModal/FullScreenModal";
import useCheckAuthState from "./components/UI/CheckAuth/useCheckAuthState";

function App() {
    const user = useAppSelector((state) => state.user.userInfo);
    const emailSent = useAppSelector((state) => state.user.emailSent);
    const authLoading = useAppSelector((state) => state.user.authLoading);
    useCheckAuthState()
    return (
        <HashRouter>
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
        </HashRouter>
    );
}

export default App;

