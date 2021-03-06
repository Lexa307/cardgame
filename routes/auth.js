const  express = require('express')
//const argon2 = require('argon2');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../app.js').pool;
router.route('/auth')
.get(function(request, response) {
	console.log(`in auth reqr = ${request.session.loggedin}`);
	if(request.session.loggedin == true){
		response.redirect('/home')
	}else{
		console.log('send login');
		response.render('login');
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

			pool.query(`SELECT * FROM accounts WHERE email = '${mail}';` , (err,results)=> {
				if (results.length > 0) {
					try { 
						bcrypt.compare(password, results[0].password).then(answer =>{
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