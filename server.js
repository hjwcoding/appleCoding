const express = require('express');
const app = express();

const PORT = 8080;

app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs');
app.use(express.json())
app.use(express.urlencoded({extended:true}))  


const { MongoClient, ObjectId } = require('mongodb');
const methodOverride = require('method-override');

app.use(methodOverride('_method'))

let db
const url = 'mongodb+srv://admin:h!36640083@admin.btmoq6r.mongodb.net/?appName=admin'
new MongoClient(url).connect().then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')
  // 서버 실행
  app.listen(8080, () => {
    console.log(`Server running on http://localhost:${PORT}`);
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

