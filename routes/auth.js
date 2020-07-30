const  express = require('express')
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const argon2 = require('argon2');
const router = express.Router();

var connection = require('../index.js');
router.route('/auth')
.get(function(request, response) {
	console.log(`in auth reqr = ${request.session.loggedin}`);
	if(request.session.loggedin == true){
		response.redirect('/home')
	}else{
		console.log('send login');
		response.sendFile(path.dirname(__dirname) + '/public/login.html');
	}
})
.post(function(request,response){
	authUser(request,response);
})

function authUser(request,response){
	var mail = request.body.mail;
	var password = request.body.password;
	let r = /[^A-Z-a-z-0-9]/;
	if(r.test(request.body.password)){
		response.json({message:" В пароле введены недопустимые символы. Разрешены латинские буквы и цифры"});
		response.end();
		return;
	}
	if (mail && password) {

			connection.query(`SELECT * FROM accounts WHERE email = '${mail}';` , (err,results)=> {
				if (results.length > 0) {
					try {
						argon2.verify(results[0].password, password).then(answer =>{
							if(answer){
								
								request.session.loggedin = true;
								request.session.mail = mail;
								request.session.nickname = results[0].username;
								request.session.gold = results[0].gold;
								request.session.playerId = results[0].id;
								response.redirect('/home');
							} else {
								// password did not match
								response.json({message:'Неправильный пользователь или пароль'});
								response.end();
							  }
						}); 
							
						 
					  } catch (error) {
						// internal failure
						response.json({message:'Ошибка сервера!'});
						response.end();
					  }

					
				} else {
					response.json({message:'Неправильный пользователь или пароль'});
					response.end();
				}			
			});
	
		
			} else {
		response.json({message:'Пожалуйста введите почту и пароль!'});
		response.end();
	}
}


module.exports = router;