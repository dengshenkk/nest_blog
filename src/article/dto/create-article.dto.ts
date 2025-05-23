import { IsString, IsNotEmpty, IsOptional, IsArray, IsInt } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsInt() // Assuming categoryId is a number, similar to authorId and tagIds
  categoryId?: number; // Changed to number

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  tagIds?: number[]; // Changed to number[]

  @IsInt()
  @IsNotEmpty()
  authorId: number;
}
