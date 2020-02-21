const  express = require('express')
const path = require('path');
const router = express.Router();

router.get('/', function(request, response) {
	response.sendFile(path.dirname(__dirname) + '/public/register.html');
});

module.exports = router;