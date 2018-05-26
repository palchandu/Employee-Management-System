var express = require('express');
var tkh = require('../app/controller/TkhController');
var router = express.Router();
router.get('/getUsers', function(req, res){
  console.log('from hgggggggggggggfrouter');

})

router.post('/getAllInfoById',tkh.getAllInfoById);
module.exports = router;
