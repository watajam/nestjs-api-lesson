import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
//jwtのプロテクトをかけるために必要
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

//nestjsでuserのエンドポイントを全てjwtでプロテクトする方法(認証関係のガードを行うものが準備されている)
//jwtのプロテクトをかけたいので引数にjwtを指定している。
//nestjsのAuthGuardは
@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  //ログインしているユーザーを取得する前に、AuthGuard('jwt')をカスタマイズするためのjwt.strategyを作成
  //jwtがヘッダー＆クッキーに含まれている場合,jwtのSecretキーがなにになるのかプロジェクト毎に変わるのでオプションをつけてカスタマイズしておくために、jwt.strategyを作成

  //ログインしているユーザーを取得する
  //jwt.strategyでreturn時にユーザーがrequest情報に含まれている
  @Get()
  getLoginUser(@Req() req: Request): Omit<User, 'hashedPassword'> {
    //custom.d.tsで方エラー繻子栄
    return req.user;
  }

  //ニックネーム変更
  @Patch()
  updateUser(
    @Req() req: Request,
    //新しいニックネーム
    @Body() dto: UpdateUserDto,
  ): Promise<Omit<User, 'hashedPassword'>> {
    return this.userService.updateUser(req.user.id, dto);
  }
}
