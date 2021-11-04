const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const should = chai.should();
const ExchangeRateController = require('../controllers/ExchangeRateController');
const assert = chai.assert;

const app = require('../app');

describe("# TEST verify function", function() {
  
  it("check if function verifyData() return false", function(){
      var result = ExchangeRateController.verifyData('test', 'wrong', 'input');
      assert.isFalse(result);
  })
  
  it("check if result of funtion verifyData() is expected", function(){
      var result = ExchangeRateController.verifyData('EUR', '100', 'TWD', '3,231');
      var expected = 'EUR,"100",=,TWD,"3,231"\n';
      assert.deepEqual( result, expected)
  })

})

describe('# TEST saving function', function () {
  
  it('check data DO NOT exist', () => {
    const randomId = Math.floor(Math.random() * (1000 - 1) ) + 1;
    assert.isFalse(ExchangeRateController.checkDataExist(randomId));
  });
  
  it('check data exist', () => {
    const randomId = Math.floor(Math.random() * (1000 - 1) ) + 1;
    ExchangeRateController.createData(randomId);
    ExchangeRateController.saveData(randomId, 'EUR,"100",=,TWD,"3,231"\n');
    assert.isTrue(ExchangeRateController.checkDataExist(randomId));
  });
  
});

describe('# TEST', function () {
  context('# [取得匯率]', () => {
    before(async () => {});

    it(' GET / ', (done) => {
      request(app)
        .get('/')
        .end(function (err, res) {
          res.text.should.include('USD');
          done();
        });
    });

    after(async () => {});
  });

  context('# [非指定介面進入]', () => {
    it(' Please visit Currency Convert page ', (done) => {
      request(app)
        .post('/api/v1/currencies')
        .end(function (err, res) {
          res.text.should.include('Please visit Currency Convert page');
          done();
        });
    });
  });

  context('# [輸入資料正確]', () => {
    it(' Please visit Currency Convert page ', (done) => {
      request(app)
        .post('/api/v1/currencies')
        .send({
          submit: 'Convert',
          amount: 100,
          currency_from: 'USD',
          currency_to: 'TWD',
        })
        .end(function (err, res) {
          res.text.should.include('200');
          done();
        });
    });
  });

  context('# 轉換USD ', () => {
    it(' [USD 11,222.02, Rate = 32.23] ', (done) => {
      request(app)
        .post('/api/v1/test')
        .send({
          amount: 11222.02,
          rate: 32.23,
        })
        .end(function (err, res, body) {
          res.text.should.include('361686');
          done();
        });
    });
  });

  context('# 轉換JPY ', () => {
    it(' [JPY 31,999, Rate = 0.35] ', (done) => {
      request(app)
        .post('/api/v1/test')
        .send({
          amount: 31999,
          rate: 0.35,
        })
        .end(function (err, res, body) {
          res.text.should.include('11200');
          done();
        });
    });
  });
});
