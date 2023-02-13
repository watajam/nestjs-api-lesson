import { Injectable } from '@nestjs/common';

// Injectable (Injectableがあることでインジェクション「ほか（controller,service）のところでも使えるようにする」)
//@ = デコレーター
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
