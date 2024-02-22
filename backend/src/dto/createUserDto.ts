import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty({ message: 'Username should not be empty.' })
    @IsString({ message: 'Username must be a string.' })
    @MinLength(4, { message: 'Username is too short. Minimum length is 4 characters.' })
    @MaxLength(20, { message: 'Username is too long. Maximum length is 20 characters.' })
    username!: string;

    @IsNotEmpty({ message: 'Email should not be empty.' })
    @IsEmail({}, { message: 'Email must be a valid email address.' })
    email!: string;

    @IsNotEmpty({ message: 'Password should not be empty.' })
    @IsString({ message: 'Password must be a string.' })
    @MinLength(8, { message: 'Password is too short. Minimum length is 8 characters.' })
    @MaxLength(32, { message: 'Password is too long. Maximum length is 32 characters.' })
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'Password is too weak.' })
    password!: string;
}