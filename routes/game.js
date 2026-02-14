const router = require('express').Router()
const checkLogin = require('../middlewares/checkLogin.js')

router.get('/board/sub/game', checkLogin, (req, res) => {
   res.send('게임 게시판')
}) 

module.exports = router 