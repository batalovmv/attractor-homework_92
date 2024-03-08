import { BadRequestError, Body, Get, HttpCode, HttpError, InternalServerError, JsonController, NotFoundError, Param, Post, Redirect, Res, UnauthorizedError } from "routing-controllers";
import { CreateUserDto } from "../dto/createUserDto";
import { LoginUserDto } from "../dto/loginUserDto";
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { UserRepository } from "../repositories/user.repository";
import { User } from "../entities/user.entity";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { sendConfirmationEmail } from "../auth/mailer";
import { Response } from 'express';
import { RefreshTokenDto } from "../dto/RefreshTokenDto";
interface CustomJwtPayload extends JwtPayload {
    id: string; 
}
if (!process.env.JWT_SECRET) {
    throw new Error('Переменная среды JWT_SECRET не определена');
} 
if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('Переменная среды REFRESH_TOKEN_SECRET не определена');
}
const JWT_SECRET: string = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET: string = process.env.REFRESH_TOKEN_SECRET
@JsonController('/users')
export class UserController {
    @Post('/register')
    async create(@Body() userData: CreateUserDto) {
        try {
            const existingUser = await UserRepository.findOne({ where: { email: userData.email } });
            if (existingUser) {
                throw new BadRequestError('Пользователь с таким email уже существует.');
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const newUser = new User();
            // Заполняем данные пользователя...
            newUser.username = userData.username;
            newUser.password = hashedPassword;
            newUser.email = userData.email;
            newUser.isConfirmed = false;
            newUser.token = nanoid();

            await UserRepository.save(newUser);
            await sendConfirmationEmail(newUser.email, newUser.token);

            // Можно возвращать объект, и он будет автоматически сериализован в JSON
            return {
                message: 'Пожалуйста, проверьте вашу почту для подтверждения регистрации.'
            };

        } catch (error) {
            console.error('Ошибка при создании пользователя или отправке письма: ', error);

            // Вместо работы с response напрямую, бросаем исключения
            if (error instanceof HttpError) {
                // Перебрасываем исключение дальше
                throw error;
            } else {
                // Для неизвестных ошибок бросаем 500 Internal Server Error
                throw new InternalServerError('Ошибка при регистрации.');
            }
        }
    }

    @Post('/login')
    @HttpCode(200)
    async login(@Body() loginData: LoginUserDto) {
        let user;
        let accessToken;
        let refreshToken;

        if (loginData.refreshToken) {
            try {
                const decoded = jwt.verify(loginData.refreshToken, REFRESH_TOKEN_SECRET) as CustomJwtPayload;
                const userId = parseInt(decoded.id, 10);
                if (isNaN(userId)) {
                    throw new Error("Invalid ID"); // Или другой тип ошибки, который вы хотите использовать
                }

                user = await UserRepository.findOne({
                    where: {
                        id: userId, // Используем числовое значение для id
                    }
                });

                if (!user) {
                    throw new UnauthorizedError("Пользователь не найден");
                }

                // Создаем новый access token
                accessToken = jwt.sign(
                    { id: user.id, username: user.username },
                    JWT_SECRET,
                    { expiresIn: '1h' }
                );

                refreshToken = loginData.refreshToken; // Возвращаем тот же refresh token
            } catch (e) {
                throw new UnauthorizedError("Неверный или истекший refresh token");
            }
        } else if (loginData.username && loginData.password) {
            user = await UserRepository.findOne({
                where: {
                    username: loginData.username,
                }
            });

            if (!user) {
                throw new UnauthorizedError("Пользователь не найден");
            }

            const isPasswordMatch = await bcrypt.compare(loginData.password, user.password);
            if (!isPasswordMatch) {
                throw new UnauthorizedError("Неверный пароль");
            }

            accessToken = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            refreshToken = jwt.sign(
                { id: user.id, username: user.username },
                REFRESH_TOKEN_SECRET,
                { expiresIn: '7d' }
            );
        } else {
            throw new UnauthorizedError("Необходимо предоставить данные для входа или refresh token");
        }

        return {
            token: accessToken,
            refreshToken: refreshToken,
            username: user.username,
            id: user.id
        };
    }

    @Post('/refresh')
    @HttpCode(200)
    async refresh(@Body() refreshData: RefreshTokenDto) {
        const { refreshToken } = refreshData;

        try {
            // Проверяем refresh token
            const decoded = jwt.verify(refreshToken, JWT_SECRET);

            // Проверяем, что decoded является объектом и содержит свойство id
            if (typeof decoded !== 'object' || decoded === null || !('id' in decoded)) {
                throw new UnauthorizedError("Невалидный refresh token");
            }

            // Здесь мы точно знаем, что decoded имеет свойство id, но TypeScript все еще не знает его типа,
            // поэтому мы используем оператор приведения типа, чтобы сообщить TypeScript, что id это строка.
            const userId = (decoded as JwtPayload).id;
            if (typeof userId !== 'string') {
                throw new UnauthorizedError("Невалидный ID в токене");
            }
            const numericUserId = parseInt(userId, 10);
            if (isNaN(numericUserId)) {
                throw new UnauthorizedError("ID пользователя должен быть числом");
            }

            // Ищем пользователя по ID из токена
            const user = await UserRepository.findOne({
                where: {
                    id: numericUserId // используем преобразованный numericUserId для поиска
                }
            });

            if (!user) {
                throw new UnauthorizedError("Пользователь не найден");
            }

            // Выдаем новый access token
            const newAccessToken = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            // Выдаем новый refresh token
            const newRefreshToken = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '7d' } // Допустим, refresh token имеет срок жизни 7 дней
            );

            // Возвращаем новые токены
            return {
                token: newAccessToken,
                refreshToken: newRefreshToken
            };

        } catch (error) {
            throw new UnauthorizedError("Невалидный refresh token");
        }
    }
    @Get('/confirm/:token')
    @HttpCode(200)
    @Redirect(`http://${process.env.FRONT_ID}:81/login`)
    async confirm(@Param('token') token: string) {
        const user = await UserRepository.findOne({ where: { token: token } });

        if (!user) {
            throw new NotFoundError('Пользователь с указанным токеном не найден.');
        }

        if (user.isConfirmed) {
            throw new BadRequestError('Пользователь уже подтвержден.');
        }

        user.isConfirmed = true;
        user.token = null;
        await UserRepository.save(user);

        // В этом случае редирект будет выполнен автоматически благодаря декоратору @Redirect
        // Если URL редиректа должен быть динамическим, вместо декоратора @Redirect
        // можно вернуть объект с url, который будет обработан на клиенте
        return {};
    }
}