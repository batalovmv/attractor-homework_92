import { Avatar, Box, Button, Container, Grid, Link, Snackbar, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ChangeEvent, FormEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { registerUser } from "../../features/user/userSlice";
import FormElement from "../../components/Form/FormElement";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import React from "react";



interface RegisterState {
    username: string;
    displayName: string;
    password: string;
    passwordErrors: string[];
    passwordErrors: string[];
}

const RegisterPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const errors = useAppSelector((state) => state.user.registerError);
    const [openSnackbar, setOpenSnackbar] = useState(false);

    const Alert = React.forwardRef<HTMLDivElement, AlertProps>((props, ref) => (
        <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
    ));

    const [state, setState] = useState<RegisterState>({
        displayName: "",
        username: "",
        password: "",
        passwordErrors: [],
    });

    const getErrorsBy = (name: string) => {
        if (Array.isArray(errors)) {
            const error = errors.find(({ type }) => type === name);
            return error?.messages.join(",");
        }
    };
    const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setState((prevState) => ({ ...prevState, [name]: value }));
    };

    const submitFormHandler = (e: FormEvent) => {
    const submitFormHandler = (e: FormEvent) => {
        e.preventDefault();
        if (state.username.trim() === "" || state.password.trim() === "") {
            setOpenSnackbar(true);
            return;
        }
        const passwordErrors: string[] = [];
        if (state.password.length < 8) {
            passwordErrors.push("Пароль слишком короткий. Минимальная длина — 8 символов.");
        }
        if (state.password.length > 32) {
            passwordErrors.push("Пароль слишком длинный. Максимальная длина — 32 символа.");
        }
        if (!/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(state.password)) {
            passwordErrors.push(
                "Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву, одну цифру или специальный символ.");
        }
        setState((prevState) => ({
            ...prevState,
            passwordErrors: passwordErrors,
        }));

        if (passwordErrors.length > 0) {
            return;
        }

        dispatch(registerUser({ ...state }))
            .unwrap()
            .then(() => {
                navigate("/");
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                    <LockOutlinedIcon />
                </Avatar>

                <Typography component="h1" variant="h5">
                    Register
                </Typography>

                <Box
                    component="form"
                    onSubmit={submitFormHandler}
                    noValidate
                    sx={{ mt: 1 }}
                >
                    <FormElement
                        label="Your name"
                        name="displayName"
                        autoFocus
                        value={state.displayName}
                        onChange={inputChangeHandler}
                        error={getErrorsBy("displayName")}
                    />

                    <FormElement
                        required
                        label="Login"
                        name="username"
                        value={state.username}
                        onChange={inputChangeHandler}
                        error={getErrorsBy("username")}
                    />

                    <FormElement
                        required
                        name="password"
                        label="Password"
                        type="password"
                        value={state.password}
                        onChange={inputChangeHandler}
                        error={getErrorsBy("password")}
                        helperText={state.passwordErrors.join(" ")}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>

                    <Grid container>
                        <Grid item>
                            <Link component={RouterLink} to="/login">
                                {"Have an account? Login"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="error">
                    Введите логин и пароль
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default RegisterPage;
