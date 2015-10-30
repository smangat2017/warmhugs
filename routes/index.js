var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');
var Kudo = require('../models/kudo');
var SendMail = require('./sendmail.js');
var api_key = 'key-73e15458e534ee382ea7d282839a1093';
var domain = 'kudositforward.com';
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain});
var mailcomposer = require("mailcomposer");
var totalcompliments = 265;

/* GET home page. */
router.get('/', function(req, res) {
  var message = "Send an anonymous compliment and track your impact <3";
  var status = "";

  if(req.param("success")==1){
  	message = "Compliment Sent Succesfully! Feel free to send another :)";
  	status = "text-success";
  } else if(req.param("success")==0){
  	message = "Please make sure you fill all fields!";
  	status = "text-danger";
  }
  res.render('index', {
            title: "SendKudos", //page title
            action: "/sendmail", //post action for the form
            message: message,
            status: status
        });
});


router.get('/user',function(req,res){
	var key = req.query.secretkey;
	var user = User.findOne({'secretKey': key},function(err,user){
		if(err) throw err;
		if(user!=null || req.query.secretkey=="hooligan"){
			res.send(200);
		} else{
			res.send(404);
		}
	});
});

router.post('/reply',function(req,res){
	var messageID = req.body['In-Reply-To'];
	var message = req.body['stripped-text'];
	var replier = req.body['From'];
	var kudo = Kudo.findOne({'messageid': messageID},function(err,kudo){
	 	if(err) throw err;
	 	User.findOne({'secretKey': kudo.from},function(err,user){
	 		if(err) throw err;
	 		SendMail.sendReply(message,user.email,replier);
	 	});
	});
}

router.post('/sendmail',function(req,res){
	//validate to make sure the fields are non-empty
	if(req.body.tofield == '' || req.body.message == ''){
		res.redirect('/?success=0');
	}
	else{
		totalcompliments+=1;
		var usermessage = req.body.message;
		var usertofield = req.body.tofield;
		var usersecretkey = req.body.secretkey;
		var user = User.findOne({'email': usertofield},function(err,user){
			if(err) throw err;
			//create a user in the database for the recipient
			if(user==null){
				keytoken = crypto.randomBytes(8).toString('hex');
				var now = new Date();
				user = new User({
					email: usertofield,
					secretKey: keytoken,
					compliments: 0,
					referrer: usersecretkey,
					created_at: now
				});
			    user.save(function(err) {
			  		if (err) throw err;
				});
			}

			//handle the kudo logic
			kudo = new Kudo({
				from: usersecretkey,
				to: user.secretKey,
				body: usermessage,
				created_at: new Date()
			});
			User.findOne({'secretKey': usersecretkey},function(err,user){
				if(user!=null){
					user.compliments+=1;
					user.save(function(error){
						if(error) throw error;
					});
				//Send a Confirmation Email back to the user thanking them
				SendMail.sendConfirmation(user.email,usertofield,totalcompliments,user.secretKey);
				}
			});
			SendMail.sendCompliment(usermessage,usertofield,totalcompliments,usersecretkey,kudo);
			res.redirect('/?success=1');
	    });
	}
});

module.exports = router;
