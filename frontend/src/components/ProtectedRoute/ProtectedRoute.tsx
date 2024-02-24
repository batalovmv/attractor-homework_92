import { Navigate} from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import { Box, CircularProgress } from "@mui/material";

interface Props {
    isAllowed?: boolean;
    redirectPath: string;
    children: React.ReactNode; // Лучше использовать React.ReactNode для типизации детей
}

const ProtectedRoute = ({ isAllowed, redirectPath, children }: Props) => {
    const authLoading = useAppSelector((state) => state.user.authLoading);

    if (authLoading) {
        // Центрируем индикатор загрузки на странице
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!isAllowed) {
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;