const  express = require('express')
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const argon2 = require('argon2');
const router = express.Router();

router.use(session({
	secret: 'secret',
	resave: false,
    saveUninitialized: true,
    
}));
router.use(bodyParser.urlencoded({extended : true}));
router.use(bodyParser.json());

router.get('/', function(request, response) {
	console.log(`in auth reqr = ${request.session.loggedin}`);
	if(request.session.loggedin == true){
		response.redirect('/home')
	}else{
		
		response.sendFile(path.dirname(__dirname) + '/public/login.html');
	}
	

});


module.exports = router;