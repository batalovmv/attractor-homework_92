import {Container} from "@mui/material";
import "./App.css";
import { JwtPayload, jwtDecode } from 'jwt-decode';
import AppToolbar from "./components/UI/AppToolbar/AppToolbar";
import { Route, Routes } from "react-router-dom";
import RegisterPage from "./containers/RegisterPage/RegisterPage";
import PostsPage from "./containers/post/PostsPage";
import PostDetailsPage from "./containers/post/PostDetailsPage";
import LoginPage from "./containers/LoginPage/LoginPage";
import NewPost from "./containers/post/NewPost";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import userSlice, { loadFromLocalStorage, loginUser, logoutUser } from "./features/user/userSlice";
import { useEffect } from "react"
import FullScreenModal from "./components/UI/MailModal/FullScreenModal";

function App() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.userInfo);
    const emailSent = useAppSelector((state) => state.user.emailSent);
    const authLoading = useAppSelector((state) => state.user.authLoading);
    useEffect(() => {
        async function checkAuthState() {
            const userInfo = loadFromLocalStorage('userInfo');
            const token = userInfo?.token;

            if (token) {
                try {
                    console.log('Token before decoding:', token);
                    const decodedToken = jwtDecode<JwtPayload>(token);
                    console.log('Decoded token:', decodedToken);
                    if (decodedToken && typeof decodedToken.exp === 'number') {
                        const isTokenExpired = decodedToken.exp < Date.now() / 1000;
                        console.log('Token expiration time:', new Date(decodedToken.exp * 1000));
                        console.log('Current time:', new Date());
                        if (!isTokenExpired) {
                            // Восстановление сессии пользователя
                            dispatch(loginUser(userInfo));
                        } else {
                            // Токен просрочен
                            dispatch(logoutUser());
                        }
                    } else {
                        // Невалидный токен
                        dispatch(logoutUser());
                    }
                } catch (error) {
                    // Ошибка при декодировании токена
                    dispatch(logoutUser());
                }
            } else {
                // Токена нет
                dispatch(userSlice.actions.setAuthLoading(false));
            }
        }

        checkAuthState();
    }, [dispatch]);

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
                            element={
                                <ProtectedRoute
                                    isAllowed={!!user && !authLoading}
                                    redirectPath="/login"
                                >
                                    <Route path="/add-post" element={<NewPost />} />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Container>
            </main>
            <FullScreenModal open={emailSent} />
        </>
    );
}

export default App;

