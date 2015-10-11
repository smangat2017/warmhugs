var express = require('express');
var router = express.Router();
var api_key = 'key-73e15458e534ee382ea7d282839a1093';
var domain = 'sandbox419b7360fa174f0aadc48d29471c91c2.mailgun.org';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});	
var crypto = require('crypto');
var mailcomposer = require("mailcomposer");
var User = require('../models/user');
var mailintro = "Hey! <br> Hope you're having a wonderful day. Just wanted to let you know that someone appreciates you. Here's what they said...<br>";
var mailending = "<br> Now it's your turn to pay it forward. Your private key is: <b>"
var mailfinal = "<b> go to http://stoodle.com and send some love to the people in your life :)"


/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
            title: "SendKudos", //page title
            action: "/sendmail", //post action for the form
            message: "Send an anonymous compliment and track your impact <3"
        });
});

router.get('/user',function(req,res){
	var key = req.query.secretkey;
	var user = User.findOne({'secretKey': key},function(err,user){
		if(err) throw err;
		if(user!=null){
			res.send(200);
		} else{
			res.send(404);
		}
	});
});

router.post('/sendmail',function(req,res){
	//validate to make sure the fields are non-empty

	var user = User.findOne({'email': req.body.tofield},function(err,user){
		if(err) throw err;
		if(user==null){
			var token = crypto.randomBytes(8).toString('hex');
			var now = new Date();
			user= new User({
				email: req.body.tofield,
				secretKey: token,
				compliments: 0,
				created_at: now
			});
		    user.save(function(err) {
		  		if (err) throw err;
		  		console.log('User saved successfully!');
			});
		}

		var mail = mailcomposer({
	  		from: 'postmaster@sandbox419b7360fa174f0aadc48d29471c91c2.mailgun.org',
	  		to: req.body.tofield,
	  		subject: 'Someone Wrote You A Compliment - Read it Now :)',
	  		body: '',
	  		html: mailintro + req.body.message + mailending + req.body.secretkey + mailfinal
		});
		mail.build(function(mailBuildError, message) {
			var dataToSend = {
				to: req.body.tofield,
				message: message.toString('ascii')
			};

			mailgun.messages().sendMime(dataToSend, function (sendError, body) {
				if (sendError) {
					console.log(sendError);
					return;
				} 
			});
		});
		res.redirect('/');
	});
});

module.exports = router;
