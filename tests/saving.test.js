const chai = require('chai');
const app = require('../app');
const ExchangeRateController = require('../controllers/ExchangeRateController.js');
var assert = chai.assert;

describe(" test saving function", function() {
  
    it("check if function verifyData() return false", function(){
        var result = ExchangeRateController.verifyData('test', 'wrong', 'input');
        assert.isFalse(result);
    })
    
    it("check if result of funtion verifyData() is expected", function(){
        var result = ExchangeRateController.verifyData('EUR', '100', 'TWD', '3,231');
        var expected = 'EUR, "100", =, TWD, "3,231"\n';
        assert.deepEqual( result, expected)
    })

})