const express = require('express');
const router = express.Router();
router.route('/exit')
.post((req,res)=>{
req.session.destroy(() => {
    res.clearCookie('session_cookie_name', {path: '/home'});
    res.redirect('/');
    });
});
module.exports = router;