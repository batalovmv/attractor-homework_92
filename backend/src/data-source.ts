import { DataSource } from 'typeorm';

import { User } from './entities/user.entity';
import { Post } from './entities/post.entity';
import { BlogComment } from './entities/blogComment.entity';
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'Abc11223344',
  database: 'test',
  entities: [Post, BlogComment,User],
  synchronize: true
});