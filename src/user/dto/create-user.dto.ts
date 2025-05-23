import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsPhoneNumber, IsDateString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  // Consider using a more specific validator like @IsPhoneNumber if region-specific validation is needed.
  // For now, IsString and IsNotEmpty will suffice based on UserEntity.
  phone: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsString()
  @IsNotEmpty()
  // Consider using an Enum if gender has predefined values
  gender: string;

  @IsOptional() // Making birthday optional as it might not be provided during initial creation
  @IsString() // Or @IsDateString() if a specific date format is required
  birthday?: string;
}
