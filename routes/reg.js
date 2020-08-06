const  express = require('express')
let router = express.Router();
const argon2 = require('argon2');
var pool = require('../app.js').pool;
router.route('/reg')
.get(function(request, response) {
	response.render('register');
})
.post(function(request, response) {
	registerUser(request,response);
});

function registerUser(request,response){
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
	pool.query(`SELECT * FROM accounts WHERE email = '${mail}';`,(err,results)=>{
		if (results.length > 0) {
			response.json({message:'Введенная почта уже зарегистрирована'});
			response.end();
			return;
		} else {
			pool.query(`SELECT * FROM accounts WHERE username = '${nickname}';`,(err,results)=>{
				if (results.length > 0) {
					response.json({message:'Этот никнейм уже используется'});
					response.end();
					return;
				} else {
						argon2.hash(request.body.password).then(hash =>{
							pool.query(`INSERT INTO accounts (username, password, email, gold,rank_points, rank, matches, matches_win) VALUES ('${nickname}', '${hash}', '${mail}', '0','0','1','0','0');`,(err,results)=>{
								pool.query(`select id from accounts where email = '${mail}'`,(err,res)=>{
									let userid = res[0].id;
									//console.log(`user: ${userid}`);
									pool.query(`SELECT card_id from card where pack_id = 1`,
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

										pool.query(queryStringInsertCards,
											(err,result)=>{
												request.session.loggedin = true;
												// request.session.mail = mail;
												// request.session.nickname = nickname;
												// request.session.gold = 0;
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