import { Container } from "@mui/material";
import "./App.css";
import AppToolbar from "./components/UI/AppToolbar/AppToolbar";
import { Route, Routes } from "react-router-dom";
import RegisterPage from "./containers/RegisterPage/RegisterPage";
import PostsPage from "./containers/post/PostsPage";
import PostDetailsPage from "./containers/post/PostDetailsPage";

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
