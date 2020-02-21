const  express = require('express')
const router = express.Router(); 
// router.route('/auth').post((req,res)=>{
//     res.redirect('/auth');
// })
router.use('/auth',require('./auth.js'));
router.use('/reg',require('./reg.js'));
router.use('/home',require('./home.js'))
module.exports = router;