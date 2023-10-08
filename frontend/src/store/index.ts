import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../features/user/userSlice";
import { postReducer } from "../features/post/postSlice";

const store = configureStore({
  reducer: {
    [userSlice.name]: userSlice.reducer,
    post: postReducer,
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
