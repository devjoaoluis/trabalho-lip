import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DrizzleService } from "../db/drizzle.service";
import { usuarios } from "src/db/schema";
import { eq, and } from "drizzle-orm";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(private db: DrizzleService) {}

  async create(dto: CreateUserDto) {
    const hash = await bcrypt.hash(dto.password, 10);
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

  async saveRefreshToken(userId: string, token: string): Promise<void> {
    await this.db.db.update(usuarios).set({ refreshToken: token }).where(eq(usuarios.id, userId));
  }

  async findByRefreshToken(userId: string, token: string) {
    const result = await this.db.db
      .select()
      .from(usuarios)
      .where(and(eq(usuarios.id, userId), eq(usuarios.refreshToken, token)))
      .limit(1);
    return result[0] ?? null;
  }

  async saveResetToken(userId: string, token: string, expiry: Date): Promise<void> {
    await this.db.db
      .update(usuarios)
      .set({ resetToken: token, resetTokenExpiry: expiry })
      .where(eq(usuarios.id, userId));
  }

  async findByResetToken(token: string) {
    const result = await this.db.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.resetToken, token))
      .limit(1);
    return result[0] ?? null;
  }

  async clearResetToken(userId: string): Promise<void> {
    await this.db.db
      .update(usuarios)
      .set({ resetToken: null, resetTokenExpiry: null })
      .where(eq(usuarios.id, userId));
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.db.db
      .update(usuarios)
      .set({ senhaHash: hashedPassword })
      .where(eq(usuarios.id, userId));
  }
}
