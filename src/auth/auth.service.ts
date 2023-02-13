import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
// app.moduleからグローバルimportしている ConfigModule.forRoot({ isGlobal: true }),
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { Msg, Jwt } from './interface/auth.interface';

@Injectable()
export class AuthService {
  //使用するためのdiを行い注入する
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  //ユーザー新規作成　AuthDto＝emailとpasswordのオブジェクトを受け取る
  async signUp(dto: AuthDto): Promise<Msg> {
    //パスワードをハッシュ化 12=2の12乗
    const hashed = await bcrypt.hash(dto.password, 12);

    // PrismaServiceのメソッドを使ってdatabaseにcreateする
    // prisma.userのuserの部分がprismaで作成したUserモデルに対応している
    try {
      await this.prisma.user.create({
        data: {
          email: dto.email,
          hashedPassword: hashed,
        },
      });
      return {
        message: 'ok',
      };
    } catch (error) {
      //prismaの操作に伴うエラーコードはPrismaClientKnownRequestErrorで定義されている
      //新規でユーザーを作成する際におきるエラーは既存で同じemailが登録されていた場合
      // スキーマのemailは「  email   String   @unique」とユニークになっているのｄえ対応するエラーはP2002
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('This email is already taken');
        }
      }
      //それ以外のエラーはthrow
      throw error;
    }
  }

  async login(dto: AuthDto): Promise<Jwt> {
    //dtoに一致するemailが存在するか確認
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException('Email or password incorrect');

    //ユーザーのハッシュ化されたパスワードと入力したパスワードを検索
    const isValid = await bcrypt.compare(dto.password, user.hashedPassword);
    if (!isValid) throw new ForbiddenException('Email or password incorrect');

    //jwtトークンを生成
    return this.generateJwt(user.id, user.email);
  }

  //jwtを生成するメソッド
  async generateJwt(userId: number, email: string): Promise<Jwt> {
    //jwtを生成するためのpayloadを定義
    const payload = {
      sub: userId,
      email,
    };
    //環境変数からJWT_SECRETを呼び出す
    const secret = this.config.get('JWT_SECRET');
    // payloadとsecret を使ってjwtを生成する
    const token = await this.jwt.signAsync(payload, {
      //アクセストークンの有効期限
      expiresIn: '5m',
      secret: secret,
    });
    //生成されたjwtトークンのアクセストークンを返す
    return {
      accessToken: token,
    };
  }
}
