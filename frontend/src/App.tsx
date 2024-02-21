import { Container } from "@mui/material";
import "./App.css";
import AppToolbar from "./components/UI/AppToolbar/AppToolbar";
import { Route, Routes } from "react-router-dom";
import RegisterPage from "./containers/RegisterPage/RegisterPage";
import PostsPage from "./containers/post/PostsPage";
import PostDetailsPage from "./containers/post/PostDetailsPage";
import LoginPage from "./containers/LoginPage/LoginPage";
import NewPost from "./containers/post/NewPost";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import userSlice, { loadFromLocalStorage } from "./features/user/userSlice";
import { useEffect } from "react";


function App() {
    const dispatch = useAppDispatch();
  const user = useAppSelector((state) => {
    return state.user.userInfo;
  });
    useEffect(() => {
        const userInfo = loadFromLocalStorage('userInfo');
        if (userInfo) {
            dispatch(userSlice.actions.setUserInfo(userInfo));
        }
    }, []);
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
    </>
  );
}
export default App

