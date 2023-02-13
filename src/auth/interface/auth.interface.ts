// auth.controllerやauth.serviceで使用するデータ型を定義しておく

// レスポンスのＭｅｓｓａｇｅの型
export interface Msg {
  message: string;
}
// csrfの型
export interface Csrf {
  csrfToken: string;
}
// jwtの型
export interface Jwt {
  accessToken: string;
}
