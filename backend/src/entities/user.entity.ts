import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "./post.entity";
import { BlogComment } from "./blogComment.entity";
import { Exclude } from 'class-transformer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Exclude()
  @Column()
  password!: string;

    @Column({
        type: "enum",
        enum: ["admin", "user", "editor"], // Пример перечисления ролей
        default: "user"
    })
    role!: string;

  @Column({ unique: true })
  token!: string;

  @OneToMany(() => Post, post => post.user)
  posts!: Post[];

  @OneToMany(() => BlogComment, comment => comment.user)
  comments!: BlogComment[];
}