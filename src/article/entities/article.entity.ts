import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { TagEntity } from '@/tag/entities/tag.entity';
import { UserEntity } from '@/user/entities/user.entity';

@Entity('t_article')
export class ArticleEntity extends BaseEntity {
  @Column({ comment: '标题' })
  title: string;

  @Column({ comment: '小结' })
  summary: string;

  @Column({ comment: '内容' })
  body: string;

  @Column({ comment: '是否发布' })
  published: boolean;

  @Column({ comment: '分类' })
  categoryId: string;

  // @Column({ comment: '作者' })
  @ManyToOne(() => UserEntity, (user) => user.articles)
  author: UserEntity;
  // ===========================

  @ManyToMany(() => TagEntity)
  @JoinColumn()
  tags: TagEntity[];
}
