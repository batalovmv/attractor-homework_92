import { Body, HttpError, JsonController, Post } from "routing-controllers";
import { CreateUserDto } from "../dto/createUserDto";
import { LoginUserDto } from "../dto/loginUserDto";
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import { UserRepository } from "../repositories/user.repository";

@JsonController('/users')
export class UserController {
  @Post('/register')
  async create(@Body() userData: CreateUserDto) {
    console.log(userData)
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = UserRepository.create({
      ...userData,
      password: hashedPassword
    });
    newUser.token = nanoid();
    await UserRepository.save(newUser);
    return newUser;
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

    user.token = nanoid();
    await UserRepository.save(user);

    return { token: user.token };
  }
}