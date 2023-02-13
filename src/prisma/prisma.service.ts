import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
//extends PrismaClient= PrismaClientクラスの機能を使うため継承
//PrismaClientを継承しているので、PrismaClientで定義されているcreateやdeleteなどのdatabaseを簡単に操作するメソッドをPrismaServiceから利用できる
export class PrismaService extends PrismaClient {
  // ConfigServiceを利用するためiocで自動化インスタンス化(DI)
  constructor(private readonly config: ConfigService) {
    //superは継承しているPrismaClientクラスにあるconstructorの処理を参照
    super({
      datasources: {
        db: {
          //.envファイルから環境変数を取得
          url: config.get('DATABASE_URL'),
        },
      },
    });
  }
}
