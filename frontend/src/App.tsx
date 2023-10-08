import { Container } from "@mui/material";
import "./App.css";
import AppToolbar from "./components/UI/AppToolbar/AppToolbar";
import { Route, Routes } from "react-router-dom";
import RegisterPage from "./containers/RegisterPage/RegisterPage";
import LoginPage from "./containers/LoginPage/LoginPage";


function App() {
  return (
    <>
      <AppToolbar />
      <main>
        <Container maxWidth="xl">
          <Routes>
            <Route path="/" element={"HOME PAGE"}/>
            <Route path="/register" element={<RegisterPage/>}/>
            <Route path="/login" element={ <LoginPage/>}/>
						
					</Routes>
        </Container>
      </main>
    </>
  );
}

export default App;
