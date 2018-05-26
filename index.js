var express  = require('express');
var bodyparser = require('body-parser')
var mongoose  = require('mongoose');
var USER = require('./routes/adminrout');
var PaypalMod = require('./routes/paypalModel');
var MYcompanyRecord = require('./app/Model/user.js');
var MyFollow  =  require('./app/Model/FollowerForllowingModels.js');
var tkh =require('./routes/tkh');
var Pal = require('./routes/paypalModel');
var jwt = require('jsonwebtoken');
var http = require('http');
var bcrypt = require('bcrypt');
var morgan = require('morgan');
const ejs = require('ejs');
var app = express();
app.use(bodyparser.urlencoded({
  extended : false
}));
app.use(bodyparser.json());
mongoose.connect('mongodb://localhost/Employee_Management');
//var companyRecord = require('./app/Model/user.js');
app.set('view engine','ejs');
app.get('../view/index',(req,res) => {
  res.send('index');
});

  app.use(morgan('combined'));
  console.log('this is very simpale combined');
  app.set('trust proxy', true);


app.use(morgan('dev'));
console.log('this is dev param ');

app.use('/user',USER);
app.use('/pal',PaypalMod);
app.use('/follow',MyFollow)



app.use('/TKH/*', function(req, res, next){
    console.log('****/ETH route required UserId in all apis uses MIDDLEWARE****');
    let userid = req.body.userid;
    var token =  req.headers["authorization"];
  if (token) {
    try {
      token = token.split(' ')[1];

      var decoded = jwt.verify(token,'secret',function (err,decoded){

        if(err){

          res.send({status :400, message: 'Authorization token is not valid',error : err});
        }else {
          console.log(decoded,"decoded token")
          req.user = decoded;

              if(userid){
               MYcompanyRecord.findOne({ _id : req.body.userid },{ active :1 }, function(err, userStatus){

                  if(err) res.send({ status : 400, message : 'Please login again'});
                  console.log('userStatususerStatus',userStatus);
                  if(!userStatus){
                    res.send({ status : 400, message : 'User doest not exists.'})
                  }
                  else if(userStatus.active){
                      next();
                  }
                  else{
                         console.log('dddddddddddddddddddddddddddddd',userStatus.active)
                      res.send({ status : 400, message : 'Please login again'})
                  }
              })

            }
            else{
              res.send({ status : 400, message : 'Please enter user ID'})
            }

          // next();
        }
      });
    } catch (e) {
      console.log('myyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',e);
      return res.send({status:400, message: 'Authorization token is not valid'});
    }
  } else {
    console.log("No token");
    return res.send({status:400,message: 'Authorization token missing in request.'});
  }
})

app.use('/TKH', tkh);


console.log('hooooooooooooooooooooooooo');
app.listen(8050,function(req,res){
  console.log("port 8050 is Running......................... ");
})
module.exports = app;
