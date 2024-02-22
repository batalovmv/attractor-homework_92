
import { AppDataSource } from '../data-source';
import { Like } from '../entities/like.entity';


export const LikeRepository = AppDataSource.getRepository(Like);