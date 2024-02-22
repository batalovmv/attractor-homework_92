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
    throw new Error('JWT_SECRET is not defined');
}
const JWT_SECRET: string = process.env.JWT_SECRET;
@JsonController('/users')
export class UserController {
    @Post('/register')
    async create(@Body() userData: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const newUser = new User();
        newUser.username = userData.username;
        newUser.password = hashedPassword;
        newUser.email = userData.email;
        newUser.isConfirmed = false; 
        newUser.token = nanoid();

        try {
            await UserRepository.save(newUser);
            await sendConfirmationEmail(newUser.email, newUser.token);
            // Не выдаем токен сразу после регистрации
        } catch (error) {
            console.error('Ошибка при создании пользователя или отправке письма: ', error);
            throw error;
        }

        // Возвращаем сообщение о том, что требуется подтверждение
        return { message: 'Пожалуйста, проверьте вашу почту для подтверждения регистрации.' };
    }

  @Post('/login')
  async login(@Body() loginData: LoginUserDto) {
    const user = await UserRepository.findOne({
      where: {
        username: loginData.username,
      }
    });

    if (!user) throw new HttpError(401, "User not found");

    const isPasswordMatch = await bcrypt.compare(loginData.password, user.password);

    if (!isPasswordMatch) throw new HttpError(401, "Unauthorized");

      const token = jwt.sign(
          { id: user.id, username: user.username },
          JWT_SECRET,
          { expiresIn: '1h' } 
      );

      return { token: token, username: user.username, id: user.id };
  }
    @Get('/confirm/:token')
    async confirm(@Param('token') token: string, @Res() response: Response) {
        const user = await UserRepository.findOne({ where: { token: token } });

        if (!user) {
            throw new NotFoundError('Пользователь с указанным токеном не найден.').message;
        }

        if (user.isConfirmed) {
            throw new BadRequestError('Пользователь уже подтверждён.').message;
        }

        
        user.isConfirmed = true;
        user.token = null; 
        await UserRepository.save(user);

       
        response.redirect(`http://${process.env.FRONT_ID}/login?confirmed=true`);
    }
}