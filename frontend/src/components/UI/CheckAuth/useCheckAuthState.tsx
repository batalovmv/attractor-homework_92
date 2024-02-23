import { useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import  {  loginUser, logoutUser } from "../../../features/user/userSlice";
import { JwtPayload, jwtDecode } from "jwt-decode";

const useCheckAuthState = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        async function checkAuthState() {
            const userInfoString = localStorage.getItem('userInfo');
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                const token = userInfo?.token;
                const refreshToken = userInfo?.refreshToken; // Предполагаем, что refreshToken хранится вместе с userInfo

                if (token && refreshToken) {
                    try {
                        const decodedToken = jwtDecode<JwtPayload>(token);
                        // Если токен истек, но есть refreshToken, попытаемся обновить токен
                        if (decodedToken.exp && typeof decodedToken.exp === 'number' && Date.now() >= decodedToken.exp * 1000) {
                            dispatch(refreshToken({ refreshToken }));
                        } else {
                            dispatch(loginUser(userInfo));
                        }
                    } catch (error) {
                        console.error('Token decode failed:', error);
                        dispatch(logoutUser());
                    }
                } else {
                    dispatch(logoutUser());
                }
            } else {
                dispatch(logoutUser());
            }
        }

        checkAuthState();
    }, [dispatch]);

    
};

export default useCheckAuthState;