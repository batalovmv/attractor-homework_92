import React, { ChangeEvent, FormEvent, useState } from "react";
import { Alert, Avatar, Box, Button, Grid, Link, Stack, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link as RouterLink } from "react-router-dom";
import InputField from "../../components/Form/FormElement";
import { useAppSelector } from "../../store/hooks";

interface RegistrationFormProps {
    username: string;
    email: string;
    password: string;
    usernameErrors: string[];
    emailErrors: string[];
    passwordErrors: string[];
    onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: FormEvent) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
    username,
    email,
    password,
    usernameErrors,
    emailErrors,
    passwordErrors,
    onInputChange,
    onSubmit,
}) => {
    const [showPassword, setShowPassword] = useState(false);
   
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    return (
        <Box
            component="form"
            onSubmit={onSubmit}
            noValidate
            sx={{
                marginTop: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center" }}
        >
            <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
                <LockOutlinedIcon />
            </Avatar>

            <Typography component="h1" variant="h5">
                Register
            </Typography>

            <InputField
                required
                label="Login"
                name="username"
                value={username}
                onChange={onInputChange}
                error={usernameErrors.length > 0}
                helperText={usernameErrors.join(" ")}
            />

            <InputField
                required
                label="Email"
                name="email"
                value={email}
                onChange={onInputChange}
                error={emailErrors.length > 0}
                helperText={emailErrors.join(" ")}
            />

            <InputField
                required
                label="Password"
                type="password"
                name="password"
                value={password}
                onChange={onInputChange}
                error={passwordErrors.length > 0}
                helperText={passwordErrors.join(" ")}
                showPassword={showPassword}
                togglePasswordVisibility={togglePasswordVisibility}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                Sign Up
            </Button>

            <Grid container>
                <Grid item>
                    <Link component={RouterLink} to="/login">
                        {"Have an account? Login"}
                    </Link>
                </Grid>
            </Grid>
        </Box>
        
    );
};

export default RegistrationForm;