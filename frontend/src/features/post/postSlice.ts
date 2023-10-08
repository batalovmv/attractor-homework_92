import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IPost } from "../../interfaces/IPost";
import axiosInstance from "../../Api/axiosInstance";
import { RootState } from "../../store";
import { isAxiosError } from "axios";

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

export const deletePost = createAsyncThunk<
  number,
  number,
  {
    state: RootState;
  }
>("delete/post", async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().user.userInfo?.token;
    const response = await axiosInstance.delete(`/posts/${id} `, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (isAxiosError(error)) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "An error occured"
      );
    } else {
      return thunkAPI.rejectWithValue("An error occured");
    }
  }
});

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
