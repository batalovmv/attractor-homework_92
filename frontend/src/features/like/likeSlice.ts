import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../Api/axiosInstance";
import { RootState } from "../../store";
import { isAxiosError } from "axios";
import { IPost } from "../../interfaces/IPost";


interface LikeState {
    posts: IPost[];
    error: Error | null;
    loading: boolean;
}

const initialState: LikeState = {
    posts: [],
    error: null,
    loading: false,
};

export const likePost = createAsyncThunk(
    "like/post",
    async (postId: number, { getState, rejectWithValue }) => {
        try {
            const token = (getState() as RootState).user.userInfo?.token;
            const response = await axiosInstance.post(`/likes/post/${postId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            if (isAxiosError(error)) {
                return rejectWithValue(error.response?.data || "An error occurred");
            }
            return rejectWithValue("An error occurred");
        }
    }
);

export const unlikePost = createAsyncThunk(
    "unlike/post",
    async (postId: number, { getState, rejectWithValue }) => {
        try {
            const token = (getState() as RootState).user.userInfo?.token;
            const response = await axiosInstance.delete(`/likes/post/${postId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response.data;
        } catch (error) {
            if (isAxiosError(error)) {
                return rejectWithValue(error.response?.data || "An error occurred");
            }
            return rejectWithValue("An error occurred");
        }
    }
);

const likeSlice = createSlice({
    name: "like",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(likePost.pending, (state) => {
                state.loading = true;
            })
            .addCase(likePost.fulfilled, (state, action) => {
                state.loading = false;
                const postId = action.meta.arg;
                const post = state.posts.find(p => p.id === postId);
                if (post) {
                    post.likeCount += 1;
                    post.currentUserLiked = true;
                }
            })
            .addCase(likePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error as Error;
            });
            .addCase(unlikePost.pending, (state) => {
                state.loading = true;
            })
            .addCase(unlikePost.fulfilled, (state, action) => {
                state.loading = false;
                const postId = action.meta.arg;
                const post = state.posts.find(p => p.id === postId);
                if (post) {
                    post.likeCount -= 1;
                    post.currentUserLiked = false;
                }
            })
            .addCase(unlikePost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error as Error;
            });
    },
});

export const likeReducer = likeSlice.reducer;