const trnsRoute = require("express").Router();
const resHndlr = require("../app/Model/Responder");
//const middleware = require("../middleware");
//const constants = require("../constants");
//const jwtHandler = require("../jwtHandler");
//const transectionServices = require("./transectionServices")
//const gatewayService = require("../paymentGateway");
var gatewayService = require('../app/controller/UserController');
//var pal = require('../app/controller/UserController');
                          //var router = express.Router();



                          //trnsRoute.route("/getBalance")
                            //  .post([/*middleware.authenticate.autntctTkn*/], function (req, res) {
                                   // if(req.user._id == req.body.user_id)
                          //         transectionServices.getBalance(req,res);
                          //         // else
                          //     //     resHndlr.apiResponder(req, res, "Unathorized access", 403)
                          //     });
                          // trnsRoute.route("/sendBalance")
                          //     .post([/*middleware.authenticate.autntctTkn*/], function (req, res) {
                          //         // if(req.user._id == req.body.user_id)
                          //         transectionServices.sendBalance(req,res);
                          //         // else
                          //     //     resHndlr.apiResponder(req, res, "Unathorized access", 403)
                          //     });
                          // trnsRoute.route("/wallet")
                          //     .get([/*middleware.authenticate.autntctTkn*/], function (req, res) {
                          //         // if(req.user._id == req.body.user_id)
                          //         transectionServices.wallet(req,res);
                          //         // else
                          //     //     resHndlr.apiResponder(req, res, "Unathorized access", 403)
                          //     });
                          // trnsRoute.route("/getXrp")
                          //     .post([/*middleware.authenticate.autntctTkn*/], function (req, res) {
                          //           // let { address } = req;
                          //         transectionServices.getXrp(req,res);
                          //     });
                          // trnsRoute.route("/getXrpTransactions")
                          //     .post([/*middleware.authenticate.autntctTkn*/], function (req, res) {
                          //           // let { address } = req;
                          //         transectionServices.getXrpTransactions(req,res);
                          //     });
                          // trnsRoute.route("/getTransactionsByAccount")
                          //     .post([/*middleware.authenticate.autntctTkn*/], function (req, res) {
                          //           // let { address } = req;
                          //         transectionServices.getTransactionsByAccount(req,res);
                          //     });
trnsRoute.route("/paynow")
    .get([/*middleware.authenticate.autntctTkn*/], function (req, res) {
         // if(req.user._id == req.body.user_id)
        gatewayService.paynow(req,res);
        // else
    //     resHndlr.apiResponder(req, res, "Unathorized access", 403)
    });
trnsRoute.route("/success")
    .get([/*middleware.authenticate.autntctTkn*/], function (req, res) {
          // let { address } = req;
        gatewayService.success(req,res);
    });
trnsRoute.route("/cancel")
    .get([/*middleware.authenticate.autntctTkn*/], function (req, res) {
          // let { address } = req;
        gatewayService.cancel(req,res);
    });
                                //trnsRoute.route("/getTransactionsBit")
                                  //  .post([/*middleware.authenticate.autntctTkn*/], function (req, res) {
                                          // let { address } = req;
                                    //    transectionServices.getTransactionsBit(req,res);
                                  //  });


module.exports = trnsRoute;
