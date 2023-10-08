import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IPost } from "../../interfaces/IPost";
import axiosInstance from "../../Api/axiosInstance";

interface State {
  posts: IPost[];
  error: Error | null;
  loading: boolean;
}

const initialState: State = {
  posts: [],

  error: null,

  loading: false,
};

export const fetchPosts = createAsyncThunk(
  "fetch/posts",

  async () => {
    return await axiosInstance.get<IPost[]>("/posts").then((res) => res.data);
  }
);



export const createPost = createAsyncThunk(
  "create/post",

  async (payload: FormData) => {
    return await axiosInstance
      .post<IPost>("/posts", payload)
      .then((res) => res.data);
  }
);

export const deletePost = createAsyncThunk(
  "delete/post",
  async (id: number) => {
    await axiosInstance.delete(`/posts/${id} `);
    return id;
  }
);

const PostSlice = createSlice({
  name: "post",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.error = null;
        state.loading = false;
      })

      .addCase(fetchPosts.rejected, (state, action) => {
        state.error = action.error as Error;
        state.loading = false;
      })

      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })

      .addCase(deletePost.fulfilled, (state, action) => {
        state.loading = false;
        const deletedPostId = action.payload;
        state.posts = state.posts.filter((item) => item.id !== deletedPostId);
      })

      .addCase(deletePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error as Error;
      });
  },
});

export const postReducer = PostSlice.reducer;
