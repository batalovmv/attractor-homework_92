import { BadRequestError, Body, Get, HttpError, JsonController, NotFoundError, Param, Post, Res } from "routing-controllers";
import { CreateUserDto } from "../dto/createUserDto";
import { LoginUserDto } from "../dto/loginUserDto";
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { UserRepository } from "../repositories/user.repository";
import { User } from "../entities/user.entity";
import jwt from 'jsonwebtoken';
import { sendConfirmationEmail } from "../auth/mailer";
import { Response } from 'express';

if (!process.env.JWT_SECRET) {
    throw new Error('Переменная среды JWT_SECRET не определена');
}
const JWT_SECRET: string = process.env.JWT_SECRET;

@JsonController('/users')
export class UserController {
    @Post('/register')
    async create(@Body() userData: CreateUserDto, @Res() response: Response) {
        try {
            const existingUser = await UserRepository.findOne({ where: { email: userData.email } });
            if (existingUser) {
                return response.status(400).json({ message: 'Пользователь с таким email уже существует.' });
            }
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const newUser = new User();
            newUser.username = userData.username;
            newUser.password = hashedPassword;
            newUser.email = userData.email;
            newUser.isConfirmed = false;
            newUser.token = nanoid();

            await UserRepository.save(newUser);
            await sendConfirmationEmail(newUser.email, newUser.token);

            return response.status(201).json({ message: 'Пожалуйста, проверьте вашу почту для подтверждения регистрации.' });
        } catch (error: unknown) {
            console.error('Ошибка при создании пользователя или отправке письма: ', error);

            // Проверяем, является ли error объектом и содержит ли он свойство httpCode
            if (typeof error === 'object' && error !== null && 'httpCode' in error) {
                // Теперь мы можем безопасно обратиться к httpCode, предполагая что error имеет тип any
                const err = error as { httpCode: number; message: string };
                const statusCode = err.httpCode || 500;
                const message = statusCode === 500 ? 'Ошибка при регистрации.' : err.message;
                return response.status(statusCode).json({ message: message });
            } else {
                // Для всех других типов ошибок возвращаем 500 Internal Server Error
                return response.status(500).json({ message: 'Ошибка при регистрации.' });
            }
        }
    }

    @Post('/login')
    async login(@Body() loginData: LoginUserDto, @Res() response: Response) {
        try {
            const user = await UserRepository.findOne({
                where: {
                    username: loginData.username,
                }
            });

            if (!user) {
                return response.status(401).json({ message: "Пользователь не найден" });
            }

            const isPasswordMatch = await bcrypt.compare(loginData.password, user.password);

            if (!isPasswordMatch) {
                return response.status(401).json({ message: "Неверный пароль" });
            }

            const token = jwt.sign(
                { id: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '1h' }
            );

            return response.json({ token: token, username: user.username, id: user.id });
        } catch (error) {
            console.error('Ошибка при входе пользователя: ', error);
            return response.status(500).json({ message: 'Произошла ошибка при входе.' });
        }
    }

    @Get('/confirm/:token')
    async confirm(@Param('token') token: string, @Res() response: Response) {
        try {
            const user = await UserRepository.findOne({ where: { token: token } });

            if (!user) {
                return response.status(404).json({ message: 'Пользователь с указанным токеном не найден.' });
            }

            if (user.isConfirmed) {
                return response.status(400).json({ message: 'Пользователь уже подтвержден.' });
            }

            user.isConfirmed = true;
            user.token = null;
            await UserRepository.save(user);

            return response.redirect(`http://${process.env.FRONT_ID}/login`);
        } catch (error) {
            console.error('Ошибка при подтверждении пользователя: ', error);
            return response.status(500).json({ message: 'Произошла ошибка при подтверждении пользователя.' });
        }
    }
}