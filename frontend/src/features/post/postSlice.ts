import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IPost } from "../../interfaces/IPost";
import axiosInstance from "../../Api/axiosInstance";
import { RootState } from "../../store";
import { isAxiosError } from "axios";

interface State {
  posts: IPost[];
    pageCount: number;
  error: Error | null;
  loading: boolean;
}

const initialState: State = {
  posts: [],
  pageCount: 1,
  error: null,
  loading: false,
};

export const fetchPosts = createAsyncThunk(
    "post/fetchPosts",
    async ({ page, perPage }: { page: number; perPage: number }, { getState, rejectWithValue }) => {
        try {
            const token = (getState() as RootState).user.userInfo?.token;
            if (!token) {
                throw new Error('Token not found');
            }
            const response = await axiosInstance.get(`/posts?page=${page}&limit=${perPage}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Adjusted to match the API response structure
            return { posts: response.data.data, pageCount: response.data.lastPage };
        } catch (error) {
            if (isAxiosError(error)) {
                return rejectWithValue(error.response?.data || "An error occurred");
            }
            return rejectWithValue("An error occurred");
        }
    }
);

export const createPost = createAsyncThunk<
  IPost,
  FormData,
  { state: RootState }
>(
  "create/posts",

  async (payload: FormData, { getState }) => {
    const token = getState().user.userInfo?.token;

    return await axiosInstance
      .post<IPost>("/posts", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
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
    await axiosInstance.delete(`/posts/${id} `, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return id;
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
            state.posts = action.payload.posts; // Update posts
            state.pageCount = action.payload.pageCount; // Update pageCount
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
            state.posts = state.posts.filter(post => post.id !== action.payload);
            state.loading = false;
        })
        .addCase(deletePost.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error as Error;
        });
  },
});

export const postReducer = PostSlice.reducer;
