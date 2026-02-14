const router = require('express').Router()

router.get('/write', async (req, res) => {
  res.render('write.ejs',);
});

module.exports = router 