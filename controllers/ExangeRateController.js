const axios = require('axios');
const xml2js = require('xml2js');
const async = require('async');
const alert = require('alert');

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
            axios
              .get('http://www.floatrates.com/daily/twd.xml')
              .then((data) => {
                if (data.status === 200) {
                  rs.data = data.data;
                } else {
                  rs.error_msg =
                    'Get currency error, status code: ' + data.status;
                }
                next(null, rs);
              })
              .catch((e) => {
                rs.error_msg = e.message;
                next(rs);
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
                rs.updated_time = rst.channel.lastBuildDate;
                rs.description = rst.channel.description;

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
                    Math.round(parseFloat(el.exchangeRate[0]) * 100) / 100;
                  rs.inverse_rate_obj[el.targetCurrency[0]] =
                    Math.round(parseFloat(el.inverseRate[0]) * 100) / 100;
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
            param.description = result.description;

            param.currency_base = result.currency_base;
            param.currency_target = result.currency_target;
            param.inverse_rate_str = JSON.stringify(result.inverse_rate_obj);
            param.exchange_rate_str = JSON.stringify(result.exchange_rate_obj);

            // 頁面初始值 target => USD
            param.init = {};
            param.init.exc_USD = result.exchange_rate_obj.USD;
            param.init.inv_USD = result.inverse_rate_obj.USD;
            param.init.con_USD = Math.round(result.inverse_rate_obj.USD * 100);

            return res.render('index', { param });
          }
        }
      );
    } catch (e) {
      return res.send('getCurrencyData catch in ' + e.toString());
    }
  },
  /*
  convertCurrency: (req, res) => {
    try {
      // 取得傳入資料
      const { amount, currency, submit } = req.body;
      let error_msg = '';
      // 資料非從指定頁面傳入
      if (submit != 'CONVERT') {
        error_msg = 'Please visit Exange Rate page.';
        return res.send(error_msg);
      }
      // 資料不齊全
      else if (amount == '' || currency == '') {
        error_msg = 'Please input amount and currency.';
        return alert(error_msg);
      }
      // 取得當前匯率並轉換
      else {
        let rs = {};
        async.waterfall(
          [
            // 取得匯率資料
            (next) => {
              axios
                .get('http://www.floatrates.com/daily/twd.xml')
                .then((data) => {
                  if (data.status === 200) {
                    rs.data = data.data;
                  } else {
                    rs.error_msg =
                      'Get currency error, status code: ' + data.status;
                  }
                  next(null, rs);
                })
                .catch((e) => {
                  rs.error_msg = e.message;
                  next(rs);
                });
            },
            // 轉換匯率
            (rs, next) => {
              parser.parseString(rs.data, (err, rst) => {
                if (err) {
                  rs.error_msg = err.toString();
                  next(rs);
                } else {
                }
              });
            },
          ],
          function (error, result) {
            if (error) {
              return res.send(error.error_msg);
            } else {
            }
          }
        );
      }
    } catch (e) {
      return res.send('convertCurrency catch in ' + e.toString());
    }
  },
  */
};
