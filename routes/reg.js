const  express = require('express')
const path = require('path');
let router = express.Router();
const argon2 = require('argon2');
var connection = require('../index.js');
router.route('/reg')
.get(function(request, response) {
	console.log(path.dirname(__dirname) + '/public/register.html');
	response.sendFile(path.dirname(__dirname) + '/public/register.html');
})
.post(function(request, response) {
	console.log("FUCK");
	registerUser(request,response);
});

function registerUser(request,response){
	console.log("got it");
	let nickname = request.body.nickname;
	let mail = request.body.mail;
	//to do: form validation on server side!
	let r = /[^A-Z-a-z-0-9]/;
	if(r.test(nickname)){
		response.json({message:" В никнейме должны быть только латинские буквы и цифры"});
		response.end();
		return;
	}
	if(r.test(request.body.password)){
		response.json({message:" В пароле введены недопустимые символы. Разрешены латинские буквы и цифры"});
		response.end();
		return;
	}
	connection.query(`SELECT * FROM accounts WHERE email = '${mail}';`,(err,results)=>{
		if (results.length > 0) {
			response.json({message:'Введенная почта уже зарегистрирована'});
			response.end();
			return;
		} else {
			connection.query(`SELECT * FROM accounts WHERE username = '${nickname}';`,(err,results)=>{
				if (results.length > 0) {
					response.json({message:'Этот никнейм уже используется'});
					response.end();
					return;
				} else {
						argon2.hash(request.body.password).then(hash =>{
							connection.query(`INSERT INTO accounts (username, password, email, gold,rank_points,matches, matches_win) VALUES ('${nickname}', '${hash}', '${mail}', '0','0','0','0');`,(err,results)=>{
								connection.query(`select id from accounts where email = '${mail}'`,(err,res)=>{
									let userid = res[0].id;
									//console.log(`user: ${userid}`);
									connection.query(`SELECT card_id from card where pack_id = 1`,
									(err,result)=>{
										//console.log(result)
										let cards = result;
										let queryStringInsertCards = `INSERT INTO deck(user_id, card_id, pos) values `;
										for(let i = 0 ; i < cards.length; i++ ){
											queryStringInsertCards+=`(${userid},${cards[i].card_id},${i}),`;
										}
										queryStringInsertCards = queryStringInsertCards.substr(0,queryStringInsertCards.length-1);
										queryStringInsertCards+=`;`;
										//console.log(queryStringInsertCards);

										connection.query(queryStringInsertCards,
											(err,result)=>{
												request.session.loggedin = true;
												request.session.mail = mail;
												request.session.nickname = nickname;
												request.session.gold = 0;
												request.session.playerId = userid;
												console.log("register success");
												response.redirect('/home');
											});
									
									});
									
									

								});
								
							});
						});
				}
			}
		);}
	});
}

module.exports = router;