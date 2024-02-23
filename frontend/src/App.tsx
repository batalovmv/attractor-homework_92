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
import userSlice, { loadFromLocalStorage, logoutUser } from "./features/user/userSlice";
import { useEffect } from "react"
import FullScreenModal from "./components/UI/MailModal/FullScreenModal";

function App() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.user.userInfo);
    const emailSent = useAppSelector((state) => state.user.emailSent);
    
    useEffect(() => {
        async function checkAuthState() {
            const userInfo = loadFromLocalStorage('userInfo');
            const token = userInfo?.token;

            if (token) {
                try {
                    const decodedToken = jwtDecode<JwtPayload>(token);
                    // Проверка, что свойство exp определено в декодированном токене
                    if (decodedToken && typeof decodedToken.exp === 'number') {
                        const isTokenExpired = decodedToken.exp < Date.now() / 1000;

                        if (!isTokenExpired) {
                            dispatch(userSlice.actions.setUserInfo(userInfo));
                        } else {
                            dispatch(logoutUser());
                        }
                    } else {
                        // Если exp не определён, считаем токен недействительным
                        dispatch(logoutUser());
                    }
                } catch (error) {
                    dispatch(logoutUser());
                }
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
                                <ProtectedRoute isAllowed={!!user} redirectPath="/login" />
                            }
                        >
                            <Route path="/add-post" element={<NewPost />} />
                        </Route>
                    </Routes>
                </Container>
            </main>
            <FullScreenModal open={emailSent} />
        </>
    );
}

export default App;

