import { Container } from "@mui/material";
import "./App.css";
import AppToolbar from "./components/UI/AppToolbar/AppToolbar";
import { Route, Routes } from "react-router-dom";
import RegisterPage from "./containers/RegisterPage/RegisterPage";


function App() {
  return (
    <>
      <AppToolbar />
      <main>
        <Container maxWidth="xl">
          <Routes>
            <Route path="/" element={"HOME PAGE"}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/login" element={ "Здесь будет ввод зарегитсрированного пользователя <LoginPage/>"}/>
						
					</Routes>
        </Container>
      </main>
    </>
  );
}

export default App;
