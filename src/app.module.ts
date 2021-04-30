import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DATABASE } from '@config';
import { ArticleModule } from './article/article.module';
import { TagModule } from './tag/tag.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: DATABASE.HOST,
      port: DATABASE.PORT,
      username: DATABASE.USERNAME,
      password: DATABASE.PASSWORD,
      database: DATABASE.DATABASE,
      synchronize: true,
      autoLoadEntities: true,
      logging: true,
    }),
    ArticleModule,
    TagModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
