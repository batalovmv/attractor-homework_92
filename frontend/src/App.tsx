import { Container } from "@mui/material";
import "./App.css";
import AppToolbar from "./components/UI/AppToolbar/AppToolbar";
import { Routes } from "react-router-dom";

function App() {
  return (
    <>
      <AppToolbar />
      <main>
        <Container maxWidth="xl">
          <Routes>
						
					</Routes>
        </Container>
      </main>
    </>
  );
}

export default App;
