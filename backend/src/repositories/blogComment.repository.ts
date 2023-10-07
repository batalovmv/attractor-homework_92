
import { AppDataSource } from '../data-source';
import { BlogComment } from '../entities/blogComment.entity';

export const CommentRepository = AppDataSource.getRepository(BlogComment);