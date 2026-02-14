const router = require('express').Router()
const { ObjectId } = require('mongodb')
let connectDB = require('../database.js')

let db
connectDB.then((client) => {
  db = client.db('forum')
}).catch((err) => {
  console.log(err)
})

router.get('/edit/:id', async (req, res) => {
  let result = await db.collection('post').findOne({_id: new ObjectId(req.params.id)})
  console.log(result)
  res.render('edit.ejs', {result : result});
  // result = db.collection('post').updateOne({_id: new ObjectId(req.params.id)}, {$set : {title : req.body.title, content : req.body.content}})
  // res.render('edit.ejs', result);
});

router.put('/edit', async (req, res) => {
  let result = await db.collection('post').updateOne({_id: 1}, {$inc : {like:1}})
  console.log(req.body)
  // let result = await db.collection('post').updateOne({_id: new ObjectId(req.body.id)}, {$set : {title : req.body.title, content : req.body.content}})
  // console.log(req.body);
  // res.redirect('/list');
  // res.renderedit.ejs', {result : result});
  // result = db.collection('post').updateOne({_id: new ObjectId(req.params.id)}, {$set : {title : req.body.title, content : req.body.content}})
  // res.render('edit.ejs', result);
});

module.exports = router 