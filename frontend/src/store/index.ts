import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../features/user/userSlice";
import { postReducer } from "../features/post/postSlice";
<<<<<<< HEAD
<<<<<<< HEAD
import { postDetailsReducer } from "../features/post/postDetails";
=======
>>>>>>> 0adc8a0 ( resolve conflict)
=======
import { postDetailsReducer } from "../features/post/postDetails";
>>>>>>> 60ce0e2 ( #1 обновлены интерфейсы, добавлена страница Поста, обновлены роуты в App.tsx)

const store = configureStore({
  reducer: {
    [userSlice.name]: userSlice.reducer,
    post: postReducer,
<<<<<<< HEAD
<<<<<<< HEAD
    postDetails: postDetailsReducer,
=======
>>>>>>> 0adc8a0 ( resolve conflict)
=======
    postDetails: postDetailsReducer,
>>>>>>> 60ce0e2 ( #1 обновлены интерфейсы, добавлена страница Поста, обновлены роуты в App.tsx)
  },
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
