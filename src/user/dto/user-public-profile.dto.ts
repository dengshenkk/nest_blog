import { UserEntity } from '../entities/user.entity';

export class UserPublicProfileDto {
  id: number;
  username: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: UserEntity) {
    this.id = user.id;
    this.username = user.username;
    this.avatar = user.avatar;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
