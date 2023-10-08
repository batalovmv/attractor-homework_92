import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../features/user/userSlice";
import { postReducer } from "../features/post/postSlice";
<<<<<<< HEAD
import { postDetailsReducer } from "../features/post/postDetails";
=======
>>>>>>> 0adc8a0 ( resolve conflict)

const store = configureStore({
  reducer: {
    [userSlice.name]: userSlice.reducer,
    post: postReducer,
<<<<<<< HEAD
    postDetails: postDetailsReducer,
=======
>>>>>>> 0adc8a0 ( resolve conflict)
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
