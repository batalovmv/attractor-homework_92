import { useEffect } from "react";
import { useAppDispatch } from "../../../store/hooks";
import  {  loginUser, logoutUser } from "../../../features/user/userSlice";
import { JwtPayload, jwtDecode } from "jwt-decode";

const useCheckAuthState = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        async function checkAuthState() {
            const userInfoString = localStorage.getItem('userInfo');
            console.log('userInfoString', userInfoString)
            if (userInfoString) {
                const userInfo = JSON.parse(userInfoString);
                console.log(`userInfoString`, userInfoString);
                const token = userInfo?.token;
                console.log(`token`, token);
                const refreshToken = userInfo?.refreshToken; 
                console.log(`refreshToken`, refreshToken);

                if (token && refreshToken) {
                    try {
                        const decodedToken = jwtDecode<JwtPayload>(token);
                        // Если токен истек, но есть refreshToken, попытаемся обновить токен
                        console.log(`decodedToken`, decodedToken);
                        if (decodedToken.exp && typeof decodedToken.exp === 'number' && Date.now() >= decodedToken.exp * 1000) {
                            console.log(`refreshToken`, refreshToken);
                            dispatch(refreshToken({ refreshToken }));
                        } else {
                            console.log(`userInfo`, userInfo);
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