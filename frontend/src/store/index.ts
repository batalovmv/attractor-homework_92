import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../features/user/userSlice";
import { postReducer } from "../features/post/postSlice";

import { postDetailsReducer } from "../features/post/postDetailsSlice";
import { likeReducer } from "../features/like/likeSlice";

const store = configureStore({
  reducer: {
    [userSlice.name]: userSlice.reducer,
    post: postReducer,
    postDetails: postDetailsReducer,
    likes: likeReducer
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
