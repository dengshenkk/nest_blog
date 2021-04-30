import { EntityRepository, Repository } from 'typeorm';
import { UserEntity } from '@/user/entities/user.entity';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  async register(user: any) {
    console.log('触发注册用户', user);
    if (await this.findOne({ username: user.username })) {
      throw new BadRequestException(`用户名：'${user.username}' 已被使用`);
    }
    const result = await this.save(user as UserEntity);
    if (!result) {
      throw new BadRequestException(user, '注册失败');
    }
    return result;
  }
}
