var express = require('express');
var mongoose = require('mongoose');
//var MyFollow  =  require('../Model/FollowerFollowingCtrl.js');
var MyFollow = require('../Model/FollowerForllowingModels.js');


var follow    =   (req, res) => {
    MyFollow.findOne({_id: req.body.follower}, (err, records) => {
        if (err) return res.json('error found')
        else {
            if (records.following.indexOf(req.body.following) < 0) {
                records.following.push(req.body.following);
                records.save((err, result) => {
                    if (err)
                        return res.json('error found')
                    else {
                        MyFollow.findOne({_id: req.body.following}, (err, records) => {
                            if (err)
                                return res.json('error found again')
                            else {
                              console.log('the recordsssssssssssssssssssssssssssss are here',records);
                                if (records.follower.indexOf(req.body.follower) < 0) {
                                    records.follower.push(req.body.follower)
                                    records.save((err, result) => {
                                        if (err) return res.json('error found again too')
                                        else return res.json('so its a result')
                                    })
                                }
                            }
                        })
                    }
                })
            } else {
                return res.json('already exists')
            }
        }
    })
}
var register =  (req, res) => {
        let value = {
            name : req.body.name,
            email : req.body.email,
            Password : req.body.Password
        };
      MyFollow.create(value, (err, records) => {
      if(err) return res.json('err');
      else return res.json(records);
        })
    }


exports.follow = follow;
exports.register  = register;
