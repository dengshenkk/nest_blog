import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Timestamp } from '@/common/decorator/timestamp';

@Entity()
export class BaseEntity {
  /**
   * 主键 uuid 自动生成
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 创建时间
   */
  @CreateDateColumn({
    type: 'timestamp',
    comment: '创建时间',
    name: 'create_at',
  })
  @Timestamp()
  createAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    comment: '更新时间',
    name: 'update_at',
  })
  @Timestamp()
  updateAt: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    comment: '删除时间',
    name: 'delete_at',
  })
  @Timestamp()
  deleteAt: Date;
}
