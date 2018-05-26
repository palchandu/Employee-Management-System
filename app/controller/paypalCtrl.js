
var express = require('express');
var mongoose = require('mongoose');
//var MYcompanyRecord = require('../Model/currencies.js');
var paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AYVTNK773GJPFGR0tntTZFWAl_tJkgN-qbMafhRVgAwO0d0jXsNuT1KdcyXaeWlqmySbSc-unasn2fjO',
  'client_secret': 'ECafsQcIVKtfPxhWuYm4izV3KAtBUxZ6UBQoPXTsaEBYQxxhBomzDizHwpfMqrf6Kg-zey5ehgDnv6Ju'
});

const resHndlr = require("../Model/Responder");
const Currencies = require('../Model/currencies');
var BigNumber = require('bignumber.js');
//**********************************apis****************************************
paymentIntegration =  function updateUserUsd(req,res,updatedBalance,transactions)
{
  console.log('dddddddddddddddddddddddddddddddddddddddd');
     Currencies.findOneAndUpdate({'currencies.currency':'USD',userId:req.body.userid},{$set:{'currencies.$.balance':updatedBalance},$push:{transactions:transactions}},{new:true})
                   .then((result)=>{
                    console.log("*****************************************",result)
                    return resHndlr.apiResponder(req, res, 'successfully.', 200,result)
                   })
                   .catch((unsuccess)=>{return resHndlr.apiResponder(req, res, 'unsuccess.', 400,unsuccess)})
}

exports.success = function(req, res) {
    var ArrayIDs = [];
    console.log("success k parameters:   ", req.body,req.body);


        var paymentId = req.body.paymentId;
        console.log("suceess in payment", req.query)
        var payerId = req.body.PayerID;
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
                    amount:req.body.amount,
                    createdAt:new Date().getTime()
                }
                Currencies.findOne({'currencies.currency':'USD',userId:req.body.userId},{'currencies.$':1})
                .then((success)=>{
                    console.log("11111111111",success)
                    updatedBalance = parseFloat(BigNumber(req.body.amount).plus(success.currencies[0].balance))
                    console.log("2222222222222222",updatedBalance)
                   return updateUserUsd(req,res,updatedBalance,transactions);
                })
                .catch((unsuccess)=>{resHndlr.apiResponder(req, res, 'Something went wrong,if amount deducted it will be refund within 24 hrs.', 400,payment)})
             }

        });
}
exports.cancel = function(req, res) {
    res.send("Payment canceled successfully.");
}
exports.paynow = function(req, res) {
    console.log("req.query::   ",req.body.userId,req.query.amount)
    if(!req.body.amount || !req.body.userId)
        resHndlr.apiResponder(req, res, 'Please fill the required fields.', 400)
    else
    {
                          var payment = {
                            "intent": "sale",
                            "payer": {
                                "payment_method": "paypal"
                            },
                            "redirect_urls": {
                                "return_url": "http://localhost:8050/exchanges/api/v1/transection/success?userId="+req.query.userId+"&amount="+req.query.amount,
                                "cancel_url": "http://localhost:8050/exchanges/api/v1/transection/cancel"
                            },
                            "transactions": [{
                                "amount": {
                                    "total": parseInt(req.body.amount),
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
  exports.paymentIntegration = paymentIntegration;
