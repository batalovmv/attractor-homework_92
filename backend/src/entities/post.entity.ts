import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";
import { BlogComment } from "./blogComment.entity";

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  image?: string;

  @CreateDateColumn()
  datetime!: Date;

  @ManyToOne(() => User, user => user.posts)
  user!: User;

  @OneToMany(() => BlogComment, comment => comment.post, { cascade: true, onDelete: "CASCADE" })
  comments!: BlogComment[];
}
