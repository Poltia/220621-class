const app = require("express")();
// express-session 모듈 가져오고
const session = require("express-session");
// session-file-store모듈을 가져오면서 함수 실행
const FileStore = require("session-file-store")(session);

// 설치할 모듈
// -------------------------------
// npm i express-session
// 저장된 세션의 정보를 파일로 보기 위해
// npm i session-file-store
// -------------------------------

app.use(
  session({
    // 세션을 발급할때 사용되는 키 소스코드 노출 안되게 하자.
    secret: "semifjgpij",
    // 세션을 저장할고 불러올때 다시 저장할지 여부
    resave: false,
    // 세션에 저장할 때 초기화 여부
    saveUninitialized: true,
    // 저장소를 만들지 여부
    store: new FileStore(),
  })
);

app.get("/", (req, res) => {
  if (!req.session.key) {
    req.session.key = "esijfse123123lifiljse";
  }
  res.send(`key:${req.session.key}`);
});

app.get("/shop", (req, res) => {
  res.send(`난 숍${req.session.key}`);
});

// express session
app.listen(3000, () => {
  console.log("열림");
});
