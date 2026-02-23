import { DataSource } from 'typeorm';

import { User } from './users/user.entity';
import { Exhibit } from './exhibits/exhibit.entity';
import { Comment } from './comments/comment.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'yuliia',
  password: 'yuliia',
  database: 'blog',
  synchronize: false,
  logging: true,
  entities: [User, Exhibit, Comment],
  subscribers: [],
  migrations: ['../migrations/*.{ts,js}'],
});
