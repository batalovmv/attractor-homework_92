import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { IPost } from "../../interfaces/IPost";
import { IComment } from "../../interfaces/IComment";
import axiosInstance from "../../Api/axiosInstance";
import { RootState } from "../../store";
import { isAxiosError } from "axios";

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

interface CommentData {
  text: string;
  postId: number;
}

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
      .get<IComment[]>(`/comments/${id}`)
      .then((res) => res.data);
  }
);

export const createComment = createAsyncThunk<
  IComment,
  CommentData,
  { state: RootState }
>(
  "create/comment",

  async (payload: CommentData, { getState }) => {
    const token = getState().user.userInfo?.token;
    console.log(payload);

    return await axiosInstance
      .post<IComment>("/comments", payload, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => res.data);
  }
);

export const deleteComment = createAsyncThunk<
  number,
  number,
  {
    state: RootState;
  }
>("delete/comment", async (id, thunkAPI) => {
  try {
    const token = thunkAPI.getState().user.userInfo?.token;
    const response = await axiosInstance.delete(`/comments/${id} `, {
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

      .addCase(deleteComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error as Error;
      });
  },
});

export const postDetailsReducer = PostDetailsSlice.reducer;
