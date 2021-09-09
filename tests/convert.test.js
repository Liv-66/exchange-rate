const chai = require('chai');
const request = require('supertest');
const sinon = require('sinon');
const should = chai.should();

const app = require('../app');

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
        .post('/convert')
        .end(function (err, res) {
          res.text.should.include('Please visit Currency Convert page');
          done();
        });
    });
  });

  context('# [輸入資料正確]', () => {
    it(' Please visit Currency Convert page ', (done) => {
      request(app)
        .post('/convert')
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
        .post('/convert/test')
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
        .post('/convert/test')
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
