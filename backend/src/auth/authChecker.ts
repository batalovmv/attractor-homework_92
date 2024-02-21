import { Action } from 'routing-controllers';
import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/user.repository';
interface JwtPayload {
    id: number;
    username: string;
}
// Это предполагает, что у вас есть переменная JWT_SECRET в вашем .env файле
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const authorizationChecker = async (action: Action, roles: string[]): Promise<boolean> => {
    const header = action.request.headers['authorization'] || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return false; 
    }

    try {
        
        const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload;

        const user = await UserRepository.findOne({ where: { id: decodedToken.id } });

        if (!user) {
            return false; // Не авторизован, так как пользователь не найден
        }

        // Если у вас есть логика проверки ролей, добавьте её здесь.

        action.request.user = user;

        return true; // Пользователь авторизован
    } catch (error) {
        console.error(error);
        return false; // Не авторизован, так как токен невалидный
    }
};