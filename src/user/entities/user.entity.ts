import { Column, Entity, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { ArticleEntity } from '@/article/entities/article.entity';
import * as bcrypt from 'bcrypt';

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

  @Column({ type: 'varchar', comment: '用户头像', nullable: true })
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

  async setPassword(password: string): Promise<void> {
    const saltRounds = 10;
    this.password = await bcrypt.hash(password || '', saltRounds);
  }

  @BeforeInsert()
  async hashPasswordBeforeInsert(): Promise<void> {
    if (this.password) {
      await this.setPassword(this.password);
    }
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate(): Promise<void> {
    // Only hash the password if it has been changed
    // This requires fetching the original entity from the database
    // or tracking changes, which is beyond this simple example.
    // For now, we assume if password is set, it's a new password.
    if (this.password) {
      // A more robust check would be to see if this.password is already a hash
      // or if a separate field like 'newPassword' is used.
      const isPasswordPlainText = !this.password.startsWith('$2b$');
      if (isPasswordPlainText) {
        await this.setPassword(this.password);
      }
    }
  }
}
