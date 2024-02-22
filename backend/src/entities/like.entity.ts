import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { Post } from "./post.entity";
import { BlogComment } from "./blogComment.entity";

@Entity()
export class Like {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, user => user.likes)
    user!: User;

    @Column()
    userId!: number;

    @ManyToOne(() => Post, post => post.likes)
    post?: Post;

    @Column({ nullable: true })
    postId?: number;

    @ManyToOne(() => BlogComment, comment => comment.likes)
    comment?: BlogComment;

    @Column({ nullable: true })
    commentId?: number;

    @CreateDateColumn()
    datetime!: Date;
}