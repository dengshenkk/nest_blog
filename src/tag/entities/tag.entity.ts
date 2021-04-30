import { BaseEntity } from '@/common/entity/base.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { ArticleEntity } from '@/article/entities/article.entity';

@Entity('t_tag')
export class TagEntity extends BaseEntity {
  @Column()
  tag: string;

  @ManyToMany(() => ArticleEntity)
  @JoinTable()
  articles: ArticleEntity[];
}
