const router = require('express').Router()
const checkLogin = require('../middlewares/checkLogin.js')

router.get('/board/sub/sports', checkLogin, (req, res) => {
   res.send('스포츠 게시판')
})

module.exports = router 