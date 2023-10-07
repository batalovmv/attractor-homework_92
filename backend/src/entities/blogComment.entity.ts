import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Post } from "./post.entity";

@Entity()
export class BlogComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  text!: string;

  @CreateDateColumn()
  datetime!: Date;

  @ManyToOne(() => User, user => user.comments)
  user!: User;

  @ManyToOne(() => Post, post => post.comments)
  post!: Post;
}