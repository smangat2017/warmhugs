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
var Mixpanel = require('mixpanel');
var mixpanel = Mixpanel.init('e5ec94f6d2929eb347f89ea8ee8b3610');
var totalcompliments = 8014;

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
  } else if(req.param("success")==2){
    message = "You've been succesfully added to the Gratitude Pledge! You'll now receive a daily reminder to send compliments! :)";
    status = "text-success";
  } else if(req.param("success")==3){
    message = "You've already taken the gratitude pledge! :) Thank You! ";
    status = "text-success";
  }
  res.render('index', {
    title: "SendKudos", //page title
    action: "/sendmail", //post action for the form
    message: message,
    status: status
  });
});

router.get('/gratitudepledge',function(req,res){
  var key = req.param("key");
  User.findOne({'secretKey': key},function(err,user){
    if(user){
      var email= user.email;
      var key = user.secretKey;
      var list = mailgun.lists('gpledge@kudositforward.com');
      var pledge = {
        subscribed: true,
        address: email,
        vars: {secretkey: key}
      };
      list.members().create(pledge, function(err,data){
        if(err){
          res.redirect('/?success=3');
        }
      });
    } else {
    }
  });
  res.redirect('/?success=2');

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
  var replier = req.body['from'];
  mixpanel.track('Reply');
  var kudo = Kudo.findOne({'messageid': messageID},function(err,kudo){
    if(err) throw err;
    if(kudo.replied!=true){
      User.findOne({'secretKey': kudo.from},function(err,user){
        if(err) throw err;
        if(user){
          SendMail.sendReply(message,user.email,replier);
        }
      });
      kudo.replied = true;
      kudo.update();
    }
  });
  res.send(200);
});

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
    mixpanel.track('Compliment-Sent',{
      to: usertofield,
      from: usersecretkey,
      body: usermessage,
    });
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
      //user is currently the recipient

      //handle the kudo logic
      kudo = new Kudo({
        from: usersecretkey,
        to: user.secretKey,
        body: usermessage,
        replied: false,
        created_at: new Date()
      });
      //user in this is the person who's sending the compliment
      User.findOne({'secretKey': usersecretkey},function(err,user){
        if(user!=null){
          user.compliments+=1;
          user.save(function(error){
            if(error) throw error;
          });
          //Send a Confirmation Email back to the user thanking them
          SendMail.sendConfirmation(user.email,usertofield,totalcompliments,user.secretKey,usermessage,user.compliments);
        }
      });
      mixpanel.track('Safety Check',{
        to: user.secretKey,
        from: usersecretkey,
        body: usermessage,
      });
      SendMail.sendCompliment(usermessage,usertofield,totalcompliments,user.secretKey,kudo);
      res.redirect('/?success=1');
    });
  }
});

module.exports = router;
