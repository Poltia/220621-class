
// 사용할 모듈
// express ejs dotenv sequelize mysql2 (내장모듈 path) 개발용 nodemon
// path : 기본경로를 다룰수 있게 도와주는 모듈

const express = require("express");
const ejs = require("ejs");
const path = require("path");
// 폴더 경로까지만 잡으면 index를 탐색하고 찾은 index파일을 기본으로 가져옴
const { sequelize, User, Post } = require("./model"); // 키값만 빼서 샤용

// 서버 객체 생성
const app = express();

// app.set()로 express에 값을 저장
// path.join() : 매개변수로 받은 문자열들을 주소처럼 합쳐준다.
// ex) path.join('a','b') => a/b
app.set("views", path.join(__dirname, "view")); // __dirname : 현재 파일까지의 경로
// views폴더까지의 경로가 기본값. 랜더링할 파일을 모아둔 폴더

// 랜더링하는 기본 엔진을 ejs처럼 사용한다고 알려준다.
/*app.get("/", (req, res) => {
    // fs모듈로 파일을 가져오고 //
    res.send(ejs.render(data,{e}));
});*/
// html의 뷰엔진을 ejs랜더링 방식으로 바꾼다.
app.engine("html", ejs.renderFile);

// view engine을 html을 랜더링할 때 사용하겠다고 설정
app.set("view engine", "html");

// body 객체 사용하겠다고 설정.
app.use(express.urlencoded({ extended : false }));

// sequelize를 구성 해보자!
// 연결 및 테이블 생성. 여기가 처음 매핑
// sync() : 데이터베이스 동기화 하는데 사용
// 여기서 필요한 테이블들이 다 생기고 매핑된다. 절대 어긋날 일이 없다.
// 테이블의 내용이 다르면 오류가 난다.
// 여기서 CREATE TABLE 문이 여기서 실행된다.
sequelize.sync({ force:false }) // force : 강제로 초기화 시킬지 여부
    .then(() => {
        // 연결 성공시
        console.log("DB 연결");
    }).catch((err) => {
        // 연결 실패시
        console.log(err);
    });

app.get("/", (req, res) => {
    res.render("create");
});

app.post("/create", (req, res) => {
    const { name, age, msg } = req.body;
    // create()를 사용하면 해당 테이블에 컬럼을 추가할 수 있다.
    const create = User.create({
        // name 컬럼의 값
        name : name,
        // age 컬럼의 값
        age : age,
        // msg 컬럼의 값
        msg : msg
    });
    /* 위의 객체를 전달해서 컬럼을 추가할 수 있다.
    자바스크립트 구문으로 SQL동작을 시킬 수 있다.
    쿼리문을 짤 필요가 없어진다. */
});

app.get("/user", (req, res) => {
    // 추가된 유저 전체 조회
    // findAll()는 매개변수로 검색할 옵션
    // 매개변수가 없으면 전체를 다 가져온다.
    User.findAll({}).then((e) => {
        // 가져오기 성공
        res.render("page", { data:e });
    }).catch(() => {
        // 가져오기 실패. 에러페이지를 보여준다.
        res.render("err");
    })
})

app.post("/create_post", (req, res) => {
    const {name, text} = req.body;
    console.log(name, text);
    // User테이블과 Post가 연결되어있는데
    // User는 id가 기본키로 되어있고, Post는 user_id
    // findOne() : 하나를 검색할 때 사용
    User.findOne({
        where : { name : name }
    }).then((e) => {
        Post.create({
            msg : text,
            // foreignKey는 user_id고 유저의 아이디와 연결한다고 정의를 해놓았기 때문에
            // 모델에 users.js와 posts.js에 만든 모델에 
            user_id : e.id,
        });
    })
})

app.get("/view/:name", (req, res) => {
    // 해당 유저의 이름을 조회하고
    User.findOne({
        where : {
            // 누구를 찾을 건지
            // params로 전달받은 name키값에 있는 밸류로 이름을 검색
            name : req.params.name
        },
        // 리턴값을 단일 객체로 변형해서 보여준다.
        //raw : true,
        
        // 관계형 모델 불러오기
        // include로 관계를 맺어놓은 모델을 조회할 수 있다.
        // user모델의 id가 1번이면 post모델의 user_id키가 같은 것들을 조회
        include : [{
            // post 모델을 조회
            model : Post
        }]
    }).then((e) => {
        e.dataValues.Posts = e.dataValues.Posts.map((i) => i.dataValues);
        const Posts = e.dataValues;
        res.render("view", { data : Posts });
    });
});

app.post("/view_updata", (req, res) => {
    const { id, msg, text } = req.body;
    console.log(id, msg, text);
    // 수정 쿼리문 사용. 객체가 들어가는데
    // 첫번째 매개변수 객체는 수정할 내용,
    // 두번째 매개변수 객체는 검색조건
    Post.update(
        { msg : msg },
        { // 검색 조건 내용은 아이디와 메시지 둘 다 맞는 것을 탐색
            where : { id : id, msg : text }
        }
    );
});

app.get("/del/:id", (req, res) => {
    // 삭제 쿼리문. 매개변수 객체 내용은 검색조건
    Post.destroy({
        // 검색은 전달받은 params의 안에 있는 id 키값
        where : { id : req.params.id }
    }).then(() => {
        // 성공시. 유저페이지로 이동
        res.redirect("/user");
    });
});

// 서버 연결
const PORT = 3001;
app.listen(PORT, () => {
    console.log(PORT, "번 포트 사용중");
});