import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DrizzleService } from "../db/drizzle.service";
import { usuarios } from "src/db/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private db: DrizzleService) {}

  async create(dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.senha, 10);
    const user = await this.db.db
      .insert(usuarios)
      .values({
        nome: dto.nome,
        email: dto.email,
        senhaHash: hash,
      })
      .returning();
    return user[0];
  }

  async findAll() {
    return await this.db.db
      .select({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
      })
      .from(usuarios);
  }

  async findOne(id: string) {
    const user = await this.db.db.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);

    if (!user.length) {
      throw new NotFoundException("User not found");
    }

    return user[0];
  }

  async findByEmail(email: string) {
    const user = await this.db.db.select().from(usuarios).where(eq(usuarios.email, email)).limit(1);

    return user[0];
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.db.db
      .update(usuarios)
      .set({
        ...(dto.nome && { nome: dto.nome }),
        ...(dto.email && { email: dto.email }),
      })
      .where(eq(usuarios.id, id))
      .returning();

    if (!user.length) {
      throw new NotFoundException("User not found");
    }

    return user[0];
  }

  async remove(id: string) {
    const user = await this.db.db.delete(usuarios).where(eq(usuarios.id, id)).returning();

    if (!user.length) {
      throw new NotFoundException("User not found");
    }

    return {
      message: "User deleted successfully",
      user: user[0],
    };
  }
}
