import { ApiHideProperty } from '@nestjs/swagger';

import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { MinLength, MaxLength } from 'class-validator';
import { Exclude } from 'class-transformer';

import { Exhibit } from 'src/exhibits/exhibit.entity';
import { Comment } from 'src/comments/comment.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 20 })
  @MinLength(4)
  @MaxLength(20)
  username!: string;

  @Column({ type: 'text' })
  @ApiHideProperty()
  @Exclude()
  password!: string;

  @Column({ default: false })
  @ApiHideProperty()
  @Exclude()
  isAdmin!: boolean;

  @OneToMany(() => Exhibit, (exhibit) => exhibit.user, { cascade: true })
  exhibits!: Exhibit[];

  @OneToMany(() => Comment, (comment) => comment.user, { cascade: true })
  comments!: Comment[];
}
