import { Alert, Box, Container,  Snackbar, Stack } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { registerUser } from "../../features/user/userSlice";
import React from "react";
import RegistrationForm from "./RegistrationForm";
import { useRegisterForm } from "./useRegisterForm";

const RegisterPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { state, inputChangeHandler, validateAndSetErrors } = useRegisterForm();
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
   
    const submitFormHandler = (e: React.FormEvent) => {
        e.preventDefault();

        const isValid = validateAndSetErrors();

        if (!isValid) {
            setOpenSnackbar(true);
            return;
        }

       
        dispatch(registerUser({ username: state.username, email: state.email, password: state.password }))
            .unwrap()
            .then(() => {
                navigate("/");
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleSnackbarClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                
            >
                <RegistrationForm
                    username={state.username}
                    email={state.email}
                    password={state.password}
                    usernameErrors={state.usernameErrors}
                    emailErrors={state.emailErrors}
                    passwordErrors={state.passwordErrors}
                    onInputChange={inputChangeHandler}
                    onSubmit={submitFormHandler}
                />
            </Box>
            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="error">
                    Заполните все поля
                </Alert>
            </Snackbar>
           
        </Container>
    );
};

export default RegisterPage;