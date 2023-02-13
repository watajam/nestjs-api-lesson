import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { Csrf, Msg } from './interface/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/csrf')
  getCsrfToken(@Req() req: Request): Csrf {
    //csrfToken＝csrトークンを生成するメソッド
    //jsonでreturn
    return { csrfToken: req.csrfToken() };
  }

  //Postメソッド、ユーザー新規作成のエンドポイント
  //クライアントから送られてくるrequestボディのデータを取り出すために@Body()を使用する
  //  dto = emailとpass
  @Post('signup')
  signUp(@Body() dto: AuthDto): Promise<Msg> {
    return this.authService.signUp(dto);
  }

  //NetjsはPOSTメソッドのステータスコードが全て201となり、今回のログインはデータを作成していないので200が適切
  //そのために @HttpCode(HttpStatus.OK)を記載することで200になる
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: AuthDto,
    //レスポンスの型で{ passthrough: true }の指定は
    @Res({ passthrough: true }) res: Response,
  ): Promise<Msg> {
    //クライアントが受け取ったdtoのデータをうけとりjwtトークンを生成する
    const jwt = await this.authService.login(dto);
    res.cookie('access_token', jwt.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    return {
      message: 'ok',
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Msg {
    //アクセストークンを空にすることでクッキーをリセットできる
    res.cookie('access_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });
    return {
      message: 'ok',
    };
  }
}
