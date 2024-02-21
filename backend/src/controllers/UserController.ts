import { Body, HttpError, JsonController, Post } from "routing-controllers";
import { CreateUserDto } from "../dto/createUserDto";
import { LoginUserDto } from "../dto/loginUserDto";
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { UserRepository } from "../repositories/user.repository";
import { User } from "../entities/user.entity";
import jwt from 'jsonwebtoken';
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
}
const JWT_SECRET: string = process.env.JWT_SECRET;
@JsonController('/users')
export class UserController {
  @Post('/register')
  async create(@Body() userData: CreateUserDto) {
    console.log(userData)
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = new User();
    newUser.username = userData.username;
    newUser.password = hashedPassword;
    newUser.token = nanoid();
    await UserRepository.save(newUser);

    
      const token = jwt.sign(
          { id: newUser.id, username: newUser.username },
          JWT_SECRET,
          { expiresIn: '1h' } // Токен будет действителен 1 час
      );

      const responseUser = {
          id: newUser.id,
          username: newUser.username,
          token: token
      };

      return responseUser;
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
}