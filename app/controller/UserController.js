var express = require('express');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var MYcompanyRecord = require('../Model/user.js');
//var MYcompanyRecord = require('../Model/currencies.js');
var fs = require('fs');
var multer  =   require('multer');
var path = require('path');

//const fileUpload = require('express-fileupload');
var cloudinary = require('cloudinary');
var bcrypt =  require('bcrypt');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var paypal = require('paypal-rest-sdk');
var morgan = require('morgan');
const resHndlr = require("../Model/Responder.js");
const Currencies = require('../Model/currencies.js');
var BigNumber = require('bignumber.js');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  "client_id": "Ae49FxsLDxblfpzOHeqT2eO86F5l7fzyBtESraSABL0P8FXnxz0xJfDzTdwU88e_aLDR-ZWM4_wBX_Eo",
  "client_secret": "EPXccHuxrPtjZ01cGjuZjgu7Fr7oSnvar8BdK_ezMejf7eSFBEQKOlbIVYp0d3gNL3KgHCCeKLWNebHh"
});
cloudinary.config({
  cloud_name: 'dodscctjl',
  api_key: '257456973794835',
  api_secret: 'CGbZoafaKNXVctWAgH-CoiGmJOY'
});

function updateUserUsd(req,res,updatedBalance,transactions)
{
     Currencies.findOneAndUpdate({'currencies.currency':'USD',userId:req.query.userId},{$set:{'currencies.$.balance':updatedBalance},$push:{transactions:transactions}},{new:true})
                   .then((result)=>{
                    console.log("*****************************************",result)
                    return resHndlr.apiResponder(req, res, 'successfully.', 200,result)
                   })
                   .catch((unsuccess)=>{return resHndlr.apiResponder(req, res, 'unsuccess.', 400,unsuccess)})
}
var success = function(req, res) {
    var ArrayIDs = [];
    console.log("success k parameters:   ", req.params,req.query)


        var paymentId = req.query.paymentId;
        console.log("suceess in payment", req.query)
        var payerId = req.query.PayerID;
        var details = {
            "payer_id": payerId
        };

        paypal.payment.execute(paymentId, details, function(error, payment) {
          if(error)
            resHndlr.apiResponder(req, res, 'Something went wrong,if amount deducted it will be refund within 24 hrs.', 400)
        else
             {
                transactions = {
                    transactionId:payment.id,
                    amount:req.query.amount,
                    createdAt:new Date().getTime()
                }
                Currencies.findOne({'currencies.currency':'USD',userId:req.query.userId},{'currencies.$':1})
                .then((success)=>{
                    console.log("11111111111",success)
                    updatedBalance = parseFloat(BigNumber(req.query.amount).plus(success.currencies[0].balance))
                    console.log("2222222222222222",updatedBalance)
                   return updateUserUsd(req,res,updatedBalance,transactions);
                })
                .catch((unsuccess)=>{resHndlr.apiResponder(req, res, 'Something went wrong,if amount deducted it will be refund within 24 hrs.', 400,payment)})
             }

        });
}

var cancel = function(req, res) {
    res.send("Payment canceled successfully.");
}

var paynow = function(req, res){
              console.log("req.query::   ",req.query.userId,req.query.amount)
              if(!req.query.amount || !req.query.userId)
                  resHndlr.apiResponder(req, res, 'Please fill the required fields.', 400)
              else
              {
                        var payment = {
                          "intent": "sale",
                          "payer": {
                              "payment_method": "paypal"
                          },
                          "redirect_urls": {
                              "return_url": "http://localhost:8050/pal/paynow/success?userId="+req.query.userId+"&amount="+req.query.amount,
                              "cancel_url": "http://localhost:8050/pal/paynow/cancel"
                          },
                          "transactions": [{
                              "amount": {
                                  "total": parseInt(req.query.amount),
                                  "currency": "USD"
                              },
                              "description": "payment deatils of your transaction."
                          }]
                      };
                      paypal.payment.create(payment, function(error, payment) {
                          if (error) {
                              console.log(JSON.stringify(error));
                          } else {
                              if (payment.payer.payment_method === 'paypal') {
                                  var redirectUrl;
                                  for (var i = 0; i < payment.links.length; i++) {
                                      var link = payment.links[i];
                                      if (link.method === 'REDIRECT') {
                                          redirectUrl = link.href;
                                      }
                                  }
                                  console.log("redirectUrl |||||||||||||||||| ",redirectUrl)
                                  res.redirect(redirectUrl);
                                  // res.send(redirectUrl)
                              }
                          }
                      });
                  }
      }




var image_upload = (req, res)=>{
      var imageRes = "Image uploaded successfully"
      var img_base64 = req.body.image;
      binaryData = new Buffer(img_base64, 'base64');
      fs.writeFile("test.jpeg", binaryData, "binary", function(err) {
        console.log('hhhhhhhhhhhhhhhhhhhhhhhhhh');
          if (err) {
              console.log("errror in writtting file")
          } else {
                  cloudinary.uploader.upload("test.jpeg", function(result) {
                      if (result.url) {
                          res.json({
                              responseCode: 200,
                              responseMessage:"image upload successfully",
                              url: result.url
                          });
                      }
                  })
          }
      });
  }

var findAllUser = function(req,res){
  MYcompanyRecord.find({},function(err,data){
    if(err){
      res.json({ message : "There are error due to ",err  })

    }
    else if(data){ res.json({ message : "All Employee data ",data : data  })

  }else {res.json({ message : "There are error due to ",err  })}
  })
}

var registration = function(req, res) {

      let Password = req.body.Password;
      //let Email = req.body.email;
      let confirmpassword = { confirmpassword : req.body.confirmpassword };
      var token;
      if(confirmpassword.confirmpassword == Password) {

            MYcompanyRecord.findOne({Email:req.body.Email},{},function(err,data){
              if(err){  res.json({ message : "There are error due to ",err  }) }
                 if(!data){
                   crypto.randomBytes(10,function(err,buf){
                     token = buf.toString('hex');
                     req.body.verificationToken = token;
                   });
                    bcrypt.hash(Password, 10, function(err, hash) {
                      if (err) {
                          res.json({ message: "unable to bcrypt the password",status: 200 })
                        } else if (hash){
                              let requestObj = {
                                  FirstName: req.body.FirstName,
                                  LasName: req.body.LastName,
                                  Phone: req.body.Phone,
                                  Email : req.body.Email,
                                  Password: hash,
                                  verificationToken :req.body.verificationToken
                                  };

                                  if(requestObj.FirstName && requestObj.LasName && requestObj.Phone && requestObj.Email){
                                    MYcompanyRecord.create(requestObj, function(err, data) {
                                      if (err) {
                                            console.log('errrrrrrrrrrrrrrrrrr', err);
                                             res.json({ message: "error, There is unable to store record in db",status: 400 })
                                           } else if (data) {

                                               res.json({meassage :"New Account has been register successfully",status : 200})
                                               var transporter = nodemailer.createTransport({
                                                service: 'gmail',
                                                auth: {
                                                    user: 'javedkhan199501@gmail.com',
                                                    pass: 'arshwrarshi'
                                                }
                                            });
                                            var mailOptions = {
                                                from: 'javedkhan199501@gmail.com',
                                                to: 'javedkhan19950@gmail.com',
                                                subject: 'Sending Email using Node.js',
                                                text: 'this is the link for reset the password'
                                            };
                                            transporter.sendMail(mailOptions, function(error, info) {
                                                if (error) {
                                                    console.log(error);
                                                } else {
                                                    console.log('Email sent: ' + info.response);
                                                }
                                            })
                                          }
                                             else {
                               console.log("hi there are hash", data.Email);
                                res.json({ message: "There are an error to get the data", status: 400 })
                            }
                          })
                        }
                          else {res.json({ message : "Please enter the all required field ",meaasge : 400 })
                      console.log("errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",err);
                        }

                    }
                     else {
                        res.json({  message: "Password is unable to bcrypt the password" , status: 400 })
                    }
                })
              }
              else {
                res.json({messagge : "This email id is already register with us",status : 400})}
             })
      }
      else {
            res.json({ message: "Password and confirmPassword not match " });
        }
    }
    login = function(req,res) {
                var reqObj = {
                   Email : req.body.Userid,
                   Password : req.body.UserPassword
                };
                if(reqObj.Email && reqObj.Password){
                  MYcompanyRecord.findOne({Email :req.body.Userid},{},function(err ,data){
                    if(err){
                      res.json({message : "Err, unable to get the data",err,status : 400})
                    }
                    if(data) {
                      console.log('Hi, javedkhannnnnnnnnnnnnnnnnnnnnn',data);
                      if(data.Verifymail.verificationStatus == true){
                      bcrypt.compare(req.body.UserPassword,data.Password,function(err  ,success){
                        if(err){

                          res.json({message : "unable to campare the password",status : 400})

                        } else if(success){
                             var token = jwt.sign({id:data._id},'secret',{ expiresIn: '1h' });
                             return res.json({ message : "User login successfully",auth : true,token : token , data : data })

                       var userid =  function(req, res) {
                        var token = req.headers['token'];
                        jwt.verify(token, "name", function(err, decoded) {
                          if (err) return res.json(err);
                          return res.json(decoded);
                        });
                }
                 }else {
                   res.json({ message : "PLease enter the correct password ",})
                 }
               })
             }else{res.json({message :  "Your emailId is not verified ,First Please verify the email",status : 400})}
             }
               else {res.json({message : "unable to get data in this else",status : 400})}

              })
            }else {
            res.json({message : "Please enter the both user name and password carefully",status : 400})
          }
        }

       forgetPassword = function(req,res){
         crypto.randomBytes(10, function (err, buf) {
         var token = buf.toString('hex');
       });
        MYcompanyRecord.findOne({Email : req.body.Email},function(err,data){
          if(err){
            res.json({message : "Please enter the valid email",status : 400})
          } else if(data){
          //  data.verificationToken  = token;
            res.json({meassage : "Forget Password link send sucessfully on your email ",data : 200})
            var transporter = nodemailer.createTransport({
             service: 'gmail',
             auth: {
                 user: 'javedkhan199501@gmail.com',
                 pass: 'arshwrarshi'
             }
         });
         var mailOptions = {
             from: 'javedkhan199501@gmail.com',
             to: 'javedkhan19950@gmail.com',
             subject: 'Sending Email using Node.js',
             text: 'this is the link for reset the password and The token is  '+data.verificationToken
         };
         transporter.sendMail(mailOptions, function(error, info) {
             if (error) {
                 console.log(error);
             } else {
                 console.log('Email sent: ' + info.response);
             }
         })
        } else {
         res.json({message : "Please enter the correct email id",data : 400})
       }
      })
//  exports.paymentIntegration = paymentIntegration;
}

var resetPasswordByUserId = function(req, res) {
   var currentPassword    = req.body.currentPassword;
   var newPassword        = req.body.newPassword;
   var confirmNewPassword = req.body.confirmNewPassword;
   var _id = req.body.userId;

   if (currentPassword && newPassword && confirmNewPassword && _id) {
       MYcompanyRecord.findOne({ _id }, {}, function(err, data) {
           if (err) {
               res.json({
                   message: "please enter the correct userId",
                   status: 400
               })
           } else
           if (data) {
               bcrypt.compare(currentPassword, data.Password, function(err, result) {
                   console.log("hashhhhhhhhhhhhhhhhhhhhhhhhhhhhhh compare", result);
                   if (err) {
                       res.json({
                           message: "Wrong , due to wrong current password",
                           err,
                           status: 400
                       })
                   } else
                   if (result) {
                       if (newPassword === confirmNewPassword) {
                           bcrypt.hash(confirmNewPassword, 10, function(err, hash) {

                               if (err) {
                                   res.json({
                                       message: "error to bcrypt newPassword",
                                       status: 400
                                   })
                               }
                               if (hash) {
                                   console.log("thereeeeeeeeeeeeeeee", data.Password);
                                   MYcompanyRecord.findOneAndUpdate({ _id: _id}, {
                                       "$set": {"Password": hash}}, (err, rcd) => {
                                       console.log("hashhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh new pass", hash);
                                       if (err) {
                                           res.json({
                                               message: "new password unable to bcrypt the password",
                                               status: 400
                                           })
                                       } else if (rcd) {
                                           res.json({
                                               message: "Password Changed Successfully",
                                               status: 200


                                           })
                                       } else {
                                           res.json({
                                               message: "new password unable to bcrypt the password",
                                               status: 400
                                           })
                                       }
                                   })

                               } else {
                                   res.json({
                                       message: "newPassword not bcrypt sucessfully",
                                       status: 400
                                   })
                               }
                           })
                       } else {
                           res.json({
                               message: "Newpassword and confirmNewPassword does not match",
                               status: 400
                           })
                       }
                   } else {
                       res.json({
                           message: "CurrentPassword not matched",
                           status: 400
                       })
                   }

               })
           } else {
               res.json({
                   message: "Please enter the correct userId ",
                   status: 400
               })
           }
       })
   } else {
       res.json({
           message: "Please enter the all required inputs",
           status: 400
       })
   }
}



      exports.registration = registration;
      exports.login = login;
  //    exports.paymentIntegration1 =paymentIntegration1;
      exports.paynow = paynow;
      exports.success = success;
      exports.cancel = cancel;
      exports.forgetPassword = forgetPassword;
      exports.resetPasswordByUserId = resetPasswordByUserId;
      exports.image_upload  = image_upload;
     exports.findAllUser = findAllUser;
