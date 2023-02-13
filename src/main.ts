import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//DTO,クラスバリデーションで実装した機能を有効化するために必要
import { ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
//JWTトークンのやり取りをクッキーベースでやるので、クライアントのrequestからクッキーを取り出すために必要
import * as cookieParser from 'cookie-parser';
//csrf対策でcsrfトークンを使うために
import * as csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //DTO,クラスバリデーションで実装した機能を有効化するための処理
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  // corsの設定
  app.enableCors({
    //フロントとバックエンドでjwtトークンをクッキーべースで通信するようにするためtrue
    credentials: true,
    //バックエンドのサービスのアクセスを許可したい、フロントエンドのドメインを設定
    origin: [
      'http://localhost:3000',
      'https://frontend-todo-nextjs.vercel.app',
    ],
  });
  //フロントから受けっとたクッキーの解析
  app.use(cookieParser());

  //🔻CSRFの設定
  app.use(
    //クッキーの設定
    csurf({
      cookie: {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      },
      // csrf-tokenをcsurfライブラリにわたして上げるとクッキーから受け取ったSecretを
      value: (req: Request) => {
        return req.header('csrf-token');
      },
    }),
  );
  //本番環境ではprocess.env.PORTをしよう
  await app.listen(process.env.PORT || 3005);
}
bootstrap();
