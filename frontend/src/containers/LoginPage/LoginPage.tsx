import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ChangeEvent, FormEvent, useState } from "react";
import { Alert, Avatar, Box, Button, Container, Grid, Typography, Link} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { loginUser } from "../../features/user/userSlice";
import InputField from "../../components/Form/FormElement";


interface LoginState {
    username: string;
    password: string;
}

const LoginPage = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const error = useAppSelector((state) => state.user.loginError);
    const [showPassword, setShowPassword] = useState(false);
    const [state, setState] = useState<LoginState>({
        username: "",
        password: "",
    });

    const inputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setState((prevState) => ({ ...prevState, [name]: value }));
    };
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const submitFormHandler = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (state.username.trim() === "" || state.password.trim() === "") {
            return;
        }
        dispatch(loginUser({ ...state }))
            .unwrap()
            .then(() => {
                navigate("/");
            });
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
                    Login
                </Typography>
                {error ? (
                    <Alert sx={{ width: "100%", mt: 2 }} severity="error">
                        {error}
                    </Alert>
                ) : null}
                <Box
                    component="form"
                    onSubmit={submitFormHandler}
                    sx={{ mt: 1, width: "100%" }}
                >
                    <InputField
                        label="Login"
                        name="username"
                        value={state.username}
                        onChange={inputChangeHandler}
                        autoFocus
                        required
                    />

                    <InputField
                        label="Password"
                        type="password"
                        name="password"
                        value={state.password}
                        onChange={inputChangeHandler}
                        required
                        showPassword={showPassword}
                        togglePasswordVisibility={togglePasswordVisibility}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Login
                    </Button>

                    <Grid container>
                        <Grid item>
                            <Link component={RouterLink} to="/register">
                                {"Don't have an account? Register"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );



};

export default LoginPage;