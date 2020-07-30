const  express = require('express')
const router = express.Router(); 
const path = require('path');
router.use(function(req,res,next){
    console.log(req.url,"@",Date.now());
    next();
});
router.use(require('./auth.js'));
router.use(require('./reg.js'));
router.use(require('./home.js'));

module.exports = router;