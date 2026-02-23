import { ApiHideProperty } from '@nestjs/swagger';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Exclude } from 'class-transformer';
import { MinLength } from 'class-validator';

import { Exhibit } from 'src/exhibits/exhibit.entity';
import { User } from 'src/users/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  @MinLength(1)
  text!: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  @ApiHideProperty()
  @Exclude()
  userId!: User['id'];

  @ManyToOne(() => Exhibit, (exhibit) => exhibit.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exhibitId' })
  exhibit!: Exhibit;

  @Column()
  @ApiHideProperty()
  @Exclude()
  exhibitId!: Exhibit['id'];
}
