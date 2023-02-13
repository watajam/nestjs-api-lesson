import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
//npx prisma generateで生成された型
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  //ニックネーム更新
  async updateUser(
    userId: number,
    dto: UpdateUserDto,
  ): Promise<Omit<User, 'hashedPassword'>> {
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        ...dto,
      },
    });
    //パスワードは返したくないので削除する
    delete user.hashedPassword;
    return user;
  }
}
