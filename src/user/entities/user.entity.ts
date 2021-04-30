import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { ArticleEntity } from '@/article/entities/article.entity';

@Entity('t_user')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', comment: '用户名' })
  username: string;

  @Column({ type: 'varchar', comment: '用户邮箱' })
  email: string;

  @Column({ type: 'varchar', comment: '手机号码' })
  phone: string;

  @Column({ type: 'varchar', comment: '密码' })
  password: string;

  @Column({ type: 'varchar', comment: '用户头像' })
  avatar: string;

  @Column({ type: 'varchar', comment: '性别' })
  gender: string;

  @Column({ type: 'varchar', comment: '生日' })
  birthday: string;

  @Column({ type: 'varchar', comment: '状态' })
  status: string;

  @Column({ type: 'timestamp', comment: '登录时间' })
  login_at: string;

  @OneToMany(() => ArticleEntity, (article) => article.author)
  articles: ArticleEntity[];
}
