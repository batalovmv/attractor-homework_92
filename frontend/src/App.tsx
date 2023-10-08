import { Container } from "@mui/material";
import "./App.css";
import AppToolbar from "./components/UI/AppToolbar/AppToolbar";
import { Route, Routes } from "react-router-dom";
import RegisterPage from "./containers/RegisterPage/RegisterPage";
<<<<<<< HEAD
import PostsPage from "./containers/post/PostsPage";
import PostDetailsPage from "./containers/post/PostDetailsPage";
=======
import LoginPage from "./containers/LoginPage/LoginPage";
>>>>>>> c2d4b97 (Пользователь может успешно войти в систему.)


function App() {
  return (
    <>
      <AppToolbar />
      <main>
        <Container maxWidth="xl">
          <Routes>
            <Route path="/" element={<PostsPage />} />
            <Route path="/posts/:id" element={<PostDetailsPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={"Login page here <RegisterPage/>"} />
          </Routes>
        </Container>
      </main>
    </>
  );
}

export default App;
