const express = require('express');
const router = express.Router();
const io = require('../app.js').io;
router.route('/game/:game')
.get((req,res)=>{
    console.log(req.params.game);
    res.render('game')
});
module.exports = router;