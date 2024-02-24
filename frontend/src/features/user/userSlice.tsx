import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IUser } from "../../interfaces/IUser";
import axiosInstance from "../../Api/axiosInstance";
import axios, { AxiosError } from "axios";
import { isAxiosError } from "axios";
import { RootState } from "../../store";
import parseError, { ApiResponseError } from "../errors";

interface userState {
    userInfo: IUser | null;
    loading: boolean;
    registerError: null | string | userResponseValidateError;
    loginError: null | string;
    emailSent: boolean,
    authLoading: boolean,
    error: string | null;
}

type userRequest = {
    username: string;
    password: string;
    email?:string;
};

type userResponseError = {
    error: { message: string };
};



type userResponseValidateError = { type: string; messages: string[] }[];
const saveToLocalStorage = (key: string, value: any) => {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
    } catch (error) {
        console.error('Error saving to localStorage', error);
    }
};

export const loadFromLocalStorage = (key: string) => {
    try {
        const serializedValue = localStorage.getItem(key);
        if (serializedValue === null) {
            return undefined;
        }
        return JSON.parse(serializedValue);
    } catch (error) {
        console.error('Error loading from localStorage', error);
        return undefined;
    }
};

const removeFromLocalStorage = (key: string) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from localStorage', error);
    }
};

export const registerUser = createAsyncThunk<
    IUser,
    userRequest,
    { rejectValue: userResponseError | userResponseValidateError }
>("users/register", async (userData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post<IUser>(
            "/users/register",
            userData
        );
        console.log("Регистрация выполнена успешно");
        return response.data;
    } catch (err) {
        if (isAxiosError(err)) {
            const error: AxiosError<userResponseError> = err;
            console.error("Ошибка post-запроса:", err);
            return rejectWithValue(
                error.response?.data || { error: { message: "An error occurred" } }
            );
        }
        throw err;
    }
});



export const loginUser = createAsyncThunk<IUser, userRequest, { rejectValue: ApiResponseError }>(
    "auth.login",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post<IUser>("/users/login", userData);
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                return rejectWithValue(parseError(err.response));
            }
            throw err;
        }
    }
);

export const refreshToken = createAsyncThunk<
    { token: string; refreshToken: string }, // Теперь возвращаемый тип содержит и refreshToken
    { refreshToken: string },
    { rejectValue: string }
>(
    "auth/refresh",
    async ({ refreshToken }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post<{ token: string }>("/auth/refresh", { refreshToken });
            // Предполагаем, что сервер возвращает и token и refreshToken
            const data = response.data;
            const newRefreshToken = refreshToken; // Получаем новый refreshToken как-то (зависит от API)
            // Сохраняем новый токен и refreshToken в локальное хранилище
            saveToLocalStorage('authData', { token: data.token, refreshToken: newRefreshToken });
            return { token: data.token, refreshToken: newRefreshToken };
        } catch (err) {
            if (isAxiosError(err)) {
                const error: AxiosError<{ error: { message: string } }> = err;
                // Возвращаем сообщение об ошибке через rejectWithValue
                return rejectWithValue(
                    error.response?.data.error.message || "Internet connection error"
                );
            }
            throw err;
        }
    }
);

export const logoutUser = createAsyncThunk("auth.logout", async (_, { dispatch }) => {
    dispatch(userSlice.actions.logout());
});


const initialState: userState = {
    error: null,
    userInfo: null,
    registerError: null,
    loginError: null,
    loading: false,
    emailSent: false,
    authLoading: true,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserInfo: (state, action) => {
            state.userInfo = action.payload;
        },
        logout: (state) => {
            state.userInfo = null;
            removeFromLocalStorage('userInfo');
        },
        setAuthLoading(state, action) {
            state.authLoading = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.registerError = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.userInfo = { ...action.payload };
                state.loading = false;
                state.registerError = null;
                state.emailSent = true;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                if (Array.isArray(action.payload)) {
                    state.registerError = action.payload;
                } else {
                    state.registerError =
                        action.payload?.error.message ?? "Error occurred";
                }
            })
            
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.loginError = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.loginError = null;
                state.userInfo = action.payload;
                state.authLoading = false
                saveToLocalStorage('userInfo', state.userInfo);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                const errorMessage = action.payload ? action.payload.message : 'Login failed due to an unknown error';
                state.loginError = errorMessage;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.userInfo = null;
                removeFromLocalStorage('userInfo');
            })
            .addCase(refreshToken.fulfilled, (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
                state.loading = false;
                state.authLoading = false;

                if (state.userInfo) {
                    state.userInfo.token = action.payload.token;
                    state.userInfo.refreshToken = action.payload.refreshToken;
                    // Обновляем локальное хранилище
                    saveToLocalStorage('userInfo', state.userInfo);
                }
            })
            .addCase(refreshToken.rejected, (state, action) => {
                state.loading = false;
                state.authLoading = false;

                // Если payload является строкой, присваиваем её loginError, иначе устанавливаем loginError в null
                state.loginError = action.payload ?? null;
            })
            .addCase(refreshToken.pending, (state) => {
                state.authLoading = true;
            });
            
           
    },
});

export default userSlice;
export const { setUserInfo, logout, setAuthLoading } = userSlice.actions;
export const userSelect = (state: RootState) => {
    return state.user.userInfo;
};
