
import { Action } from "routing-controllers";
import { UserRepository } from "../repositories/user.repository";
import jwt from 'jsonwebtoken';
interface JwtPayload {
    id: number;
    username: string;
}


const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const currentUserChecker = async (action: Action) => {
    const header = action.request.headers['authorization'] || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return null;
    }

    try {
        // С помощью jwt.verify проверяем токен и извлекаем payload
        const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;

        // Используем id пользователя из токена для поиска в базе данных
        const user = await UserRepository.findOne({ where: { id: decodedToken.id } });

        return user || null;
    } catch (error) {
        console.error(error);
        return null;
    }
};