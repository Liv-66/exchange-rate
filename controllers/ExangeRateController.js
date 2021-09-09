const axios = require('axios');
const xml2js = require('xml2js');
const async = require('async');
const alert = require('alert');
const moment = require('moment');

parser = new xml2js.Parser();

module.exports = {
  getCurrencyData: (req, res) => {
    try {
      let param = {};
      async.waterfall(
        [
          // 取得匯率資訊
          (next) => {
            let rs = {};
            module.exports.getExchangeRate((err, rst) => {
              if (err) {
                rs.error_msg = err;
                next(rs);
              } else {
                rs.data = rst;
                next(null, rs);
              }
            });
          },
          // 整理匯率資料，組建可支援幣別
          (rs, next) => {
            parser.parseString(rs.data, (err, rst) => {
              if (err) {
                rs.error_msg = err.toString();
                next(rs);
              } else {
                rs.currency_target = [];
                rs.exchange_rate_obj = {};
                rs.inverse_rate_obj = {};
                rs.updated_time = moment(rst.channel.lastBuildDate[0]).format(
                  'YYYY-MM-DD hh:mm:ss'
                );

                // 當前貨幣 - TWD
                rs.currency_base =
                  rst.channel.baseCurrency[0] + ' - New Taiwan Dollar';

                // loop target currencies
                rst.channel.item.forEach((el) => {
                  // 貨幣選單內容
                  rs.currency_target.push(
                    el.targetCurrency[0] + ' - ' + el.targetName[0]
                  );
                  // Dashboard內容
                  rs.exchange_rate_obj[el.targetCurrency[0]] =
                    Math.round(parseFloat(el.exchangeRate[0]) * 100000) /
                    100000;
                  rs.inverse_rate_obj[el.targetCurrency[0]] =
                    Math.round(parseFloat(el.inverseRate[0]) * 100000) / 100000;
                });
                next(null, rs);
              }
            });
          },
        ],
        function (error, result) {
          if (error) {
            return res.send(error.error_msg);
          } else {
            param.updated_time = result.updated_time;
            param.currency_base = result.currency_base;
            param.currency_target = result.currency_target;
            param.inverse_rate_str = JSON.stringify(result.inverse_rate_obj);
            param.exchange_rate_str = JSON.stringify(result.exchange_rate_obj);

            // 頁面初始值 target => USD
            param.init = {};
            param.init.exc_USD = result.exchange_rate_obj.USD;
            param.init.inv_USD = result.inverse_rate_obj.USD;

            return res.render('index', { param });
          }
        }
      );
    } catch (e) {
      return res.send('getCurrencyData catch in ' + e.toString());
    }
  },
  convertCurrency: (req, res) => {
    try {
      const { amount, currency_from, currency_to, submit } = req.body;
      let error_msg = '';
      // 資料非從指定頁面傳入
      if (submit != 'Convert') {
        let url = '/localhost:3000';
        error_msg = 'Please visit Currency Convert page: ' + url + '.';
        return res.send(error_msg);
      }
      // 資料不齊全
      else if (amount == '' || currency_from == '' || currency_to == '') {
        error_msg = 'Please input amount and currency.';
        return alert(error_msg);
      }
      // 返回狀態給前端
      else {
        return res.json(200);
      }
    } catch (e) {
      return res.send('convertCurrency catch in ' + e.toString());
    }
  },
  getExchangeRate: (callback) => {
    let error_msg = '';
    axios
      .get('http://www.floatrates.com/daily/twd.xml')
      .then((data) => {
        if (data.status === 200) {
          callback(null, data.data);
        } else {
          error_msg = 'Get currency error, status code: ' + data.status;
          callback(error_msg);
        }
      })
      .catch((e) => {
        error_msg = e.message;
        callback(error_msg);
      });
  },
};
