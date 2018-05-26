var express = require('express');
var mongoose = require('mongoose');
var MYcompanyRecord = require('../Model/user.js');
var getAllInfoById = function(req,res){

       let userid = req.body.userid;
       if(req.body.userid){
         MYcompanyRecord.findOne({_id : req.body.userid},{},function(err,data){
           if(err){
             res.json({message : "There are are error in find correct id",status : 400});

           }else if(data) {
           res.json({message : "Welcome, There are all data here of particular data",status :200,data : data})
         }else {
           res.json({message : "Please enter the correct _id",status : 400})
         }
       })
     }else res.json({message : "please enter the required field",status : 400})
}
  exports.getAllInfoById  = getAllInfoById;
