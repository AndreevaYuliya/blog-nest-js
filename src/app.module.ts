import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';

import { join } from 'path';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { User } from './users/user.entity';
import { Exhibit } from './exhibits/exhibit.entity';
import { Comment } from './comments/comment.entity';
import { ExhibitsModule } from './exhibits/exhibits.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: process.env.DB_USERNAME ?? 'yuliia',
      password: process.env.DB_PASSWORD ?? 'yuliia',
      database: process.env.DB_NAME ?? 'blog',
      entities: [User, Exhibit, Comment],
      synchronize: true,
      autoLoadEntities: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    UsersModule,
    AuthModule,
    ExhibitsModule,
    CommentsModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
