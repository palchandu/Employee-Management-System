var express = require('express');

var usered = require('../app/controller/UserController');
var MyFollow = require('../app/controller/FollowerFollowingCtrl');
var router = express.Router();
router.get('/getUsers', function(req, res){
  console.log('from hgggggggggggggfrouter');

})
router.post('/registration', usered.registration);
router.post('/login',usered.login);
router.post('/forgetPassword',usered.forgetPassword);
//router.post('/paymentIntegration1',usered.paymentIntegration1);
//router.post('/paymentIntegration',usered.paymentIntegration);
router.post('/paynow',usered.paynow);
router.post('/resetPasswordByUserId',usered.resetPasswordByUserId);
router.post('/image_upload',usered.image_upload);
router.get('/findAllUser',usered.findAllUser);
router.post('/follow',MyFollow.follow);
router.post('/register',MyFollow.register);
module.exports = router;
