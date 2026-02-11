const express = require('express');
const app = express();
const PORT = process.env.PORT;
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const MongoStore = require('connect-mongo').default
let serverTime = new Date();

app.use('/list', (req, res, next) => {
  console.log(serverTime)
  next();
});

require('dotenv').config() 

app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false,
  saveUninitialized : false,
  cookie : {maxAge : 60 * 60 * 1000},
  store : MongoStore.create({
    mongoUrl :process.env.DB_URL,
    dbName : 'forum'
  })
}))



app.use(passport.session());


app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({extended:true}))  


const { MongoClient, ObjectId } = require('mongodb');
const methodOverride = require('method-override');

app.use(methodOverride('_method'))

let db
const url = process.env.DB_URL
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
  // 서버 실행
  app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
}).catch((err)=>{
  console.log(err)
})



// 기본 라우트
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// 기본 라우트
app.get('/news', (req, res) => {
  // db.collection('post').insertOne({name:'kim'});
  // res.send('')
});

app.get('/list', async (req, res) => {
  console.log(serverTime)
  let result = await db.collection('post').find().limit(5).toArray()
  console.log({ 글목록 : result })
  res.render('list.ejs', { 글목록 : result });
});

// app.get('/list/1', async (req, res) => {
//   let result = await db.collection('post').find().limit(5).toArray()
//   console.log({ 글목록 : result })
//   res.render('list.ejs', { 글목록 : result });
// });

// app.get('/list/2', async (req, res) => {
//   let result = await db.collection('post').find().skip(5).limit(5).toArray()
//   console.log({ 글목록 : result })
//   res.render('list.ejs', { 글목록 : result });
// });

app.get('/list/:id', async (req, res) => {
  let result = await db.collection('post').find().skip(5  * (req.params.id - 1)).limit(5).toArray()
  console.log({ 글목록 : result })
  res.render('list.ejs', { 글목록 : result });
});

app.get('/list/next/:id', async (req, res) => {
  let result = await db.collection('post').find({_id : {$gt : new ObjectId(req.params.id)}}).skip(5  * (req.params.id - 1)).limit(5).toArray()
  console.log({ 글목록 : result })
  res.render('list.ejs', { 글목록 : result });
});

// app.get('/list/3', async (req, res) => {
//   let result = await db.collection('post').find().skip(10).limit(5).toArray()
//   console.log({ 글목록 : result })
//   res.render('list.ejs', { 글목록 : result });
// });

app.get('/time', async (req, res) => {
  let serverTime = await new Date();
  console.log(serverTime)
  res.render('serverTime.ejs', {"serverTime" : serverTime});
});

app.get('/write', async (req, res) => {
  let serverTime = await new Date();
  res.render('write.ejs',);
});

app.get('/edit/:id', async (req, res) => {
  let result = await db.collection('post').findOne({_id: new ObjectId(req.params.id)})
  console.log(result)
  res.render('edit.ejs', {result : result});
  // result = db.collection('post').updateOne({_id: new ObjectId(req.params.id)}, {$set : {title : req.body.title, content : req.body.content}})
  // res.render('edit.ejs', result);
});

app.put('/edit', async (req, res) => {
  let result = await db.collection('post').updateOne({_id: 1}, {$inc : {like:1}})
  console.log(req.body)
  // let result = await db.collection('post').updateOne({_id: new ObjectId(req.body.id)}, {$set : {title : req.body.title, content : req.body.content}})
  // console.log(req.body);
  // res.redirect('/list');
  // res.renderedit.ejs', {result : result});
  // result = db.collection('post').updateOne({_id: new ObjectId(req.params.id)}, {$set : {title : req.body.title, content : req.body.content}})
  // res.render('edit.ejs', result);
});

app.post('/add', async (req, res) => {
  console.log(req.body);
  try{
    if(req.body.title == "" || req.body.content == ""){
      res.send('빈값은 안됩니다.')
      return
    } else {
      await db.collection("post").insertOne({ title: req.body.title, content: req.body.content});
      res.redirect('/list');
    }
  }catch(e){
    console.log(e)
    req.status(500).send('서버에러')
  }
});

app.get('/detail/:id', async(res, req)=> {
  let params = res.params;
  console.log(params)
  try{
    let result = await db.collection('post').findOne({_id : new ObjectId(params.id )})
    console.log(result)
    if (result == null){
      req.status(404).send('없는 글입니다.')
    }
    req.render('detail.ejs',{ result });
  }catch(e){
    console.log(e)
    req.status(404).send('서버에러')
  }
})

app.delete('/delete', async (req, res) => {
  console.log(req.query);
  await db.collection('post').deleteOne({_id : new ObjectId(req.query.docid)})
  res.send('삭제완료');
});

app.get('/login', async (req, res) => {
  
  res.render('login.ejs',);
});

app.post('/login', async (req, res, next) => {
  passport.authenticate('local', (error, user, info) => {
    if(error) return res.status(500).json(error);   
    if(!user) return res.status(401).json(info.message);
    console.log(req.user)
    console.log(req.password)
    req.logIn(user, (err) => {
      if (err) return next(err)
      res.redirect('/')
    })
  })(req, res, next)
});

app.get('/register', async (req, res) => {
  res.render('register.ejs');
});

app.post('/register', async (req, res) => {
  let hash = await bcrypt.hash(req.body.password,10) // 암호화할문자 / 암호화 몇번할지
  console.log(hash)
  await db.collection('user').insertOne({ 
    username : req.body.username, 
    password : hash})
    res.redirect('/');
});

// 제출한 아이디와 비밀번호를 DB와 비교하는 코드
passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let result = await db.collection('user').findOne({ username : 입력한아이디})
  if (!result) {
    return cb(null, false, { message: '아이디 DB에 없음' })
  }
  console.log(입력한비번)
  console.log(result.password)
  if (await bcrypt.compare(입력한비번, result.password)) {
    return cb(null, result)
  } else {
    return cb(null, false, { message: '비번불일치' });
  }
})) 

passport.serializeUser((user, done) => {
  console.log(user)
  process.nextTick(() => {
    done(null, { id: user._id, username: user.username })
  })
})

passport.deserializeUser(async (user, done) => {
  let result = await db.collection('user').findOne({_id : new ObjectId(user.id) })
  delete result.password
  // 비동기처리
  process.nextTick(() => {
    return done(null, result)
  })
})

function loginCheck(req, res, next){
  if(req.body.user == '' || req.body.password == ''){
    res.send('빈값은 안됩니다.')
  } else {
    next();
  }
}
