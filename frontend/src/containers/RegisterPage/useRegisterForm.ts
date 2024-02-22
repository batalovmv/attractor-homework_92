import { useState } from 'react';

interface RegisterState {
    username: string;
    email: string;
    password: string;
    passwordErrors: string[];
    emailErrors: string[];
    usernameErrors: string[];
}

const initialState: RegisterState = {
    username: '',
    email: '',
    password: '',
    passwordErrors: [],
    emailErrors: [],
    usernameErrors: [],
};

const validateFields = (username: string, email: string, password: string) => {
    const usernameErrors: string[] = [];
    const emailErrors: string[] = [];
    const passwordErrors: string[] = [];

    if (!username.trim()) {
        usernameErrors.push("Это поле обязательно к заполнению.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
        emailErrors.push("Это поле обязательно к заполнению.");
    } else if (!emailRegex.test(email)) {
        emailErrors.push("Введите корректный email.");
    }

    if (password.length < 8) {
        passwordErrors.push("Пароль слишком короткий. Минимальная длина — 8 символов.");
    }
    if (password.length > 32) {
        passwordErrors.push("Пароль слишком длинный. Максимальная длина — 32 символа.");
    }
    if (!/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(password)) {
        passwordErrors.push(
            "Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву, одну цифру или специальный символ.");
    }

    return { usernameErrors, emailErrors, passwordErrors };
}

export const useRegisterForm = () => {
    const [state, setState] = useState<RegisterState>(initialState);

    const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setState((prevState) => ({
            ...prevState,
            [name]: value,
            usernameErrors: name === 'username' ? [] : prevState.usernameErrors,
            emailErrors: name === 'email' ? [] : prevState.emailErrors,
            passwordErrors: name === 'password' ? [] : prevState.passwordErrors,
        }));
    };

    const validateAndSetErrors = () => {
        const { username, email, password } = state;
        const { usernameErrors, emailErrors, passwordErrors } = validateFields(username, email, password);

        setState((prevState) => ({
            ...prevState,
            usernameErrors,
            emailErrors,
            passwordErrors,
        }));

        return usernameErrors.length === 0 && emailErrors.length === 0 && passwordErrors.length === 0;
    };

    return {
        state,
        inputChangeHandler,
        validateAndSetErrors
    };
};