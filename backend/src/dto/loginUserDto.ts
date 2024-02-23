import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class LoginUserDto {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    password?: string;

    @IsOptional()
    @IsString()
    refreshToken?: string;
}