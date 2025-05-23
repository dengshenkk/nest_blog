import { Module } from '@nestjs/common';
import { ArticleService } from '@/article/article.service';
import { ArticleController } from '@/article/article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from '@/article/entities/article.entity';
import { UserEntity } from '@/user/entities/user.entity'; // Import UserEntity
import { TagModule } from '@/tag/tag.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ArticleEntity, UserEntity]), // Add UserEntity here
    TagModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
