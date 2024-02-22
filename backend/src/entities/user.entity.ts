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

  @Column({ unique: true })
  email!: string;

  @Exclude()
  @Column()
  password!: string;

    @Column({
        type: "enum",
        enum: ["admin", "user", "editor"], 
        default: "user"
    })
    role!: string;

    @Column('text', {
        nullable: true, transformer: {
            to: (value: any) => JSON.stringify(value),
            from: (value: string) => JSON.parse(value)
        }
    })
    token!: string | null;

  @Column({ default: false })
  isConfirmed!: boolean;

  @OneToMany(() => Post, post => post.user)
  posts!: Post[];

  @OneToMany(() => BlogComment, comment => comment.user)
  comments!: BlogComment[];
}