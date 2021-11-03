const axios = require('axios');
const xml2js = require('xml2js');
const async = require('async');
const alert = require('alert');
const moment = require('moment');
const fs = require('fs');

let savingObj = {};

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
                rs.currency_target_popular = [];
                rs.exchange_rate_obj = {};
                rs.inverse_rate_obj = {};
                const popular_currency = [
                  'EUR',
                  'USD',
                  'GBP',
                  'JPY',
                  'HKD',
                  'KRW',
                ];

                // 匯率更新時間
                rs.updated_time = moment(rst.channel.lastBuildDate[0]).format(
                  'YYYY-MM-DD hh:mm:ss'
                );

                // 當前貨幣 - TWD
                rs.currency_base =
                  rst.channel.baseCurrency[0] + ' - New Taiwan Dollar';

                // loop target currencies
                rst.channel.item.forEach((el) => {
                  // 貨幣選單內容
                  if (popular_currency.indexOf(el.targetCurrency[0]) != -1) {
                    rs.currency_target_popular.push(
                      el.targetCurrency[0] + ' - ' + el.targetName[0]
                    );
                  } else {
                    rs.currency_target.push(
                      el.targetCurrency[0] + ' - ' + el.targetName[0]
                    );
                  }
                  // Dashboard內容
                  rs.exchange_rate_obj[el.targetCurrency[0]] =
                    Math.round(parseFloat(el.exchangeRate[0]) * 100000) /
                    100000;
                  rs.inverse_rate_obj[el.targetCurrency[0]] =
                    Math.round(parseFloat(el.inverseRate[0]) * 100000) / 100000;
                });

                rs.currency_target_popular.sort();
                rs.currency_target.sort();
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
            param.currency_target_popular = result.currency_target_popular;
            param.inverse_rate_str = JSON.stringify(result.inverse_rate_obj);
            param.exchange_rate_str = JSON.stringify(result.exchange_rate_obj);

            // 頁面初始值 target => EUR
            param.init = {};
            let init_exc = result.exchange_rate_obj.EUR;
            let init_inv = result.inverse_rate_obj.EUR;

            param.init.exc_EUR_1 = module.exports.getInitData(init_exc, 1);
            param.init.exc_EUR_10 = module.exports.getInitData(init_exc, 10);
            param.init.exc_EUR_50 = module.exports.getInitData(init_exc, 50);
            param.init.exc_EUR_200 = module.exports.getInitData(init_exc, 200);
            param.init.exc_EUR_500 = module.exports.getInitData(init_exc, 500);
            param.init.exc_EUR_1000 = module.exports.getInitData(
              init_exc,
              1000
            );
            param.init.exc_EUR_5000 = module.exports.getInitData(
              init_exc,
              5000
            );

            param.init.inv_EUR_1 = module.exports.getInitData(init_inv, 1);
            param.init.inv_EUR_10 = module.exports.getInitData(init_inv, 10);
            param.init.inv_EUR_50 = module.exports.getInitData(init_inv, 50);
            param.init.inv_EUR_200 = module.exports.getInitData(init_inv, 200);
            param.init.inv_EUR_500 = module.exports.getInitData(init_inv, 500);
            param.init.inv_EUR_1000 = module.exports.getInitData(
              init_inv,
              1000
            );
            param.init.inv_EUR_5000 = module.exports.getInitData(
              init_inv,
              5000
            );

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
  getInitData: (data, times) => {
    let result = (Math.round(data * times * 100) / 100).toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
    return result;
  },
  convertTest: (req, res) => {
    let result = Math.round(req.body.amount * req.body.rate);
    return res.send(200, result);
  },
  saveCurrency: (req, res) => {
    try {
      const { input, output, from, to } = req.body;
		  
      let error_msg = '';
      if (!savingObj['someone'])
      {
        savingObj['someone'] = '';
      }
      savingObj['someone'] += module.exports.verifyData(from, input, to, output);
      console.log('someone: ', savingObj['someone']);
      module.exports.csvWriter(savingObj['someone'], (err) => {
        if (err)
        {
          console.log(err);
        }
        else
        {
          console.log('finish write stream, moving along');
        }
      });


    } catch (e) {
      return res.send('saveCurrency catch in ' + e.toString());
    }
  },
  verifyData: (from, input, to, output) => {
    if (!from || !input || !to || !output)
    {
      return false;
    }
    return `${from},"${input}",=,${to},"${output}"\n`;
  },
  csvWriter: (csv_data, cb) => {
    let writeStream = fs.createWriteStream('public/csv/data.csv', {encoding: 'utf8'});
    writeStream.write(csv_data, () => {})

    writeStream.end();
    writeStream.on('finish', () => {
      return cb(null);
    }).on('error', (err) => {
      return cb(err);
    })
  },
};
