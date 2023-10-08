import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IPost } from "../../interfaces/IPost";
import { IComment } from "../../interfaces/IComment";
import axiosInstance from "../../Api/axiosInstance";

interface State {
  post: IPost | undefined;
  comments: IComment[] | undefined;
  error: Error | null;
  loading: boolean;
}

const initialState: State = {
  post: undefined,
  comments: undefined,
  error: null,
  loading: false,
};

export const fetchPost = createAsyncThunk(
  "fetch/post",

  async (id: number) => {
    return await axiosInstance
      .get<IPost>(`/posts/${id}`)
      .then((res) => res.data);
  }
);

export const fetchComments = createAsyncThunk(
  "fetch/comments",

  async (id?: number) => {
    return await axiosInstance
      .get<IComment[]>(`/comments?post_id=${id}`)
      .then((res) => res.data);
  }
);

export const createComment = createAsyncThunk(
  "create/comment",

  async (payload) => {
    return await axiosInstance
      .post<IComment>("/comments", payload)
      .then((res) => res.data);
  }
);

export const deleteComment = createAsyncThunk(
  "delete/comment",
  async (id: number) => {
    await axiosInstance.delete(`/comments/${id} `);
    return id;
  }
);

const PostDetailsSlice = createSlice({
  name: "postDetails",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchPost.fulfilled, (state, action) => {
        state.post = action.payload;

        state.loading = false;
      })

      .addCase(fetchPost.rejected, (state, action) => {
        state.error = action.error as Error;

        state.loading = false;
      })

      .addCase(fetchPost.pending, (state) => {
        state.loading = true;
      })

      .addCase(fetchComments.fulfilled, (state, action) => {
        state.comments = action.payload;

        state.loading = false;
      })

      .addCase(fetchComments.rejected, (state, action) => {
        state.error = action.error as Error;

        state.loading = false;
      })

      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
      })

      .addCase(deleteComment.fulfilled, (state, action) => {
        state.loading = false;
        const deletedCommentId = action.payload;
        if (state.comments)
          state.comments = state.comments.filter(
            (item) => item.id !== deletedCommentId
          );
      });
  },
});

export const postDetailsReducer = PostDetailsSlice.reducer;
