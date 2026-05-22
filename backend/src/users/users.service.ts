import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DrizzleService } from '../db/drizzle.service'
import { usuarios } from 'src/db/schema';

@Injectable()
export class usersService {
  constructor(private db: DrizzleService) {}
  async create(dto: CreateUserDto) {
    const user = await this.db.db
    .insert(usuarios)
    .values(dto)
    .returning();
    return user[0]
  }

  findAll() {
    return this.db.db.select().from(usuarios);
  }

  findOne(id: number) {
    const user = await this.db.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, id))
      .limit(1);

      if(!user.length) {
        throw new NotFoundException('User not found');
      }

      return user[0];
  }

  update(id: number, dto: UpdateUserDto) {
    const user = await this.db.db
      .update(usuarios)
      .set({
        ...(dto.name && { name: dto.name }),
        ...(dto.email && { email: dto.email }),
      })
      .where(eq(usuarios.id, id))
      .returning();

    if (!user.length) {
      throw new NotFoundException('User not found');
    }

    return user[0];
  }

  remove(id: number) {
    const user = await this.db.db
      .delete(usuarios)
      .where(eq(usuarios.id, id))
      .returning();

    if (!user.length) {
      throw new NotFoundException('User not found');
    }

    return {
      message: 'User deleted successfully',
      user: user[0],
  }
}
}
