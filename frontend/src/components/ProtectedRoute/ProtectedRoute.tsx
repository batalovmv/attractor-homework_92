import { Navigate} from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

interface Props {
  isAllowed?: boolean;
  redirectPath: string;
    children:any
}

const ProtectedRoute = ({ isAllowed, redirectPath, children }:Props) => {
    const authLoading = useAppSelector((state) => state.user.authLoading);

    if (authLoading) {
        return <div>Loading...</div>; // Или индикатор загрузки, если у вас есть
    }

    if (!isAllowed) {
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};
export default ProtectedRoute;
