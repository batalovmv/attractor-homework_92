import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IUser } from "../../interfaces/IUser";
import axiosInstance from "../../Api/axiosInstance";
import { AxiosError } from "axios";
import { isAxiosError } from "axios";
import { RootState } from "../../store";

interface userState {
    userInfo: IUser | null;
    loading: boolean;
    registerError: null | string | userResponseValidateError;
    loginError: null | string;
}

type userRequest = {
    username: string;
    password: string;
};

type userResponseError = {
    error: { message: string };
};

type userResponseValidateError = { type: string; messages: string[] }[];

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

export const loginUser = createAsyncThunk<
    IUser,
    userRequest,
    { rejectValue: string }
>("auth.login", async (userData, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post<IUser>("/users/login", userData);
        return response.data;
    } catch (err) {
        if (isAxiosError(err)) {
            const error: AxiosError<userResponseError> = err;
            return rejectWithValue(
                error.response?.data.error.message || "Internet connection error"
            );
        }
        throw err;
    }
});

export const logoutUser = createAsyncThunk("auth.logout", async (_, { dispatch }) => {
    dispatch(userSlice.actions.logout());
});


const initialState: userState = {
    userInfo: null,
    registerError: null,
    loginError: null,
    loading: false,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        logout: (state) => {
            state.userInfo = null;
        }
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
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.loginError = action.payload || null;
            });
            
           
    },
});

export default userSlice;

export const userSelect = (state: RootState) => {
    return state.user.userInfo;
};
