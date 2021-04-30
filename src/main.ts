import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UserService } from '@/user/user.service';
import { INestApplication } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  // init(app);
}

bootstrap();

function init(app: INestApplication) {
  const userService: UserService = app.get<UserService>(UserService);
  const admin = {
    username: 'admin',
    password: 'admin',
    email: 'dengshenkk@gmail.com',
  };
  userService.register(admin);
}
