import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

// jwtトークンとSecretのキーがわかれば、payloadを復元する事ができるの🔻（この関数内で実行）
//payload＝auth.serviceでjwtを生成する際にしようされたもの
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // 継承しているPassportStrategyのconstructorを処理参照し、カスタマイズしたい内容を追加する
    super({
      //requestのどこにjwtがあるか確認
      //今回はクッキーを使ってクライアントから送っているのでrequestからクッキーのjwt取り出して、jwtを受け取ってjwtが正しいか検証をおこなう
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          let jwt = null;
          if (req && req.cookies) {
            jwt = req.cookies['access_token'];
          }
          return jwt;
        },
      ]),
      //trueの場合はjwtトークンがきれていたとしても、それが有効なトークンとなってしまう
      ignoreExpiration: false,
      //jwtを生成するための使ったSecretキーを指定(環境変数)
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  //jwt検証が問題なければvalidateがよびだされる、このときに受けったJWTとSecretキーがあるので、この情報をもとにpayloadを復元できるので復元したpayloadを渡している
  //PassportStrategyには中層メソッドとしてvalidateが定義されているのでPassportStrategyを継承する場合は記載しないといけない
  //payloadはauth.serviceでjwtを生成する際にしようされたもの
  //sub= uid
  async validate(payload: { sub: number; email: string }) {
    //ユーザー取得
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });
    delete user.hashedPassword;
    //nestjsのAuthGuardはjwtを解析しているのでログインユーザーとみなすのと、nest.jsではrequestにreturnされたuserの情報を自動的に含めてくれるので「req.user」でデータが取り出せる
    return user;
  }
}
