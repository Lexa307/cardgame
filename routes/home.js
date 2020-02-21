const  express = require('express')
const session = require('express-session');
const path = require('path');
const router = express.Router(); 
router.get('/', function(request, response) {
    

	if(request.session.loggedin == undefined){
		response.redirect('/auth');
	}else{
        let UserMail = request.session.mail;
        response.sendFile(path.dirname(__dirname) + '/public/home.html');
    }
});

module.exports = router;