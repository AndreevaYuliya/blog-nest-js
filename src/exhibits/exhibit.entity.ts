import { ApiHideProperty } from '@nestjs/swagger';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Exclude } from 'class-transformer';

import { User } from 'src/users/user.entity';
import { Comment } from 'src/comments/comment.entity';

@Entity()
export class Exhibit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  imageUrl!: string;

  @Column('text')
  description!: string;

  @Column({ default: 0 })
  @ApiHideProperty()
  commentCount!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.exhibits, { eager: true })
  @JoinColumn({ name: 'userId' })
  @ApiHideProperty()
  user!: User;

  @Column()
  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  userId!: User['id'];

  @OneToMany(() => Comment, (comment) => comment.exhibit, { cascade: true })
  @ApiHideProperty()
  @Exclude()
  comments!: Comment[];
}
