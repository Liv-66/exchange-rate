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
                rs.exchange_rate_ar = [];
                rs.inverse_rate_ar = [];
                rs.currency_target = [];

                rs.exchange_rate_obj = {};
                rs.inverse_rate_obj = {};
                // rs.updated_time = rst.channel.lastBuildDate;
                // rs.description = rst.channel.description;

                rs.currency_base =
                  rst.channel.baseCurrency[0] + ' - New Taiwan Dollar';

                // loop target currencies
                rst.channel.item.forEach((el) => {
                  // 貨幣選單內容
                  rs.currency_target.push(
                    el.targetCurrency[0] + ' - ' + el.targetName[0]
                  );

                  // Dashboard內容
                  let exchange_amount =
                    Math.round(parseFloat(el.exchangeRate[0])) === 0
                      ? parseFloat(el.exchangeRate[0]).toFixed(2)
                      : Math.round(parseFloat(el.exchangeRate[0]));
                  let inverse_amount =
                    Math.round(parseFloat(el.inverseRate[0])) === 0
                      ? parseFloat(el.inverseRate[0]).toFixed(2)
                      : Math.round(parseFloat(el.inverseRate[0]));
                  rs.exchange_rate_ar.push(
                    '1 TWD = ' + exchange_amount + ' ' + el.targetCurrency[0]
                  );
                  rs.inverse_rate_ar.push(
                    '1 ' +
                      el.targetCurrency[0] +
                      ' = ' +
                      inverse_amount +
                      ' TWD'
                  );
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
            // param.updated_time = result.updated_time;
            // param.description = result.description;
            // param.exchange_rate_ar = result.exchange_rate_ar;
            // param.inverse_rate_ar = result.inverse_rate_ar;
            param.currency_base = result.currency_base;
            param.currency_target = result.currency_target;
            param.inverse_rate_str = JSON.stringify(result.inverse_rate_obj);
            param.exchange_rate_str = JSON.stringify(result.exchange_rate_obj);

            param.init = {};
            param.init.exc_USD = result.exchange_rate_obj.USD;
            param.init.inv_USD = result.inverse_rate_obj.USD;
            param.init.con_USD = Math.round(result.inverse_rate_obj.USD);

            param.exchange_rate_obj = result.exchange_rate_obj;
            param.inverse_rate_obj = result.inverse_rate_obj;
            // param.currency = result.currency_ar.join(', ');
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
                    console.log('1: ', data.data.channel.item[0]);
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
            (rs, next) => {
              parser.parseString(rs.data, (err, rst) => {
                if (err) {
                  rs.error_msg = err.toString();
                  next(rs);
                } else {
                  rs.currency_ar = [];
                  rs.update_time = rst.channel.lastBuildDate;
                  rs.description = rst.channel.description;
                  rst.channel.item.forEach((el) => {
                    rs.currency_ar.push(el.targetCurrency[0]);
                  });

                  next(null, rs);
                  //   rs.base_currency = rst.channel.baseCurrency[0];
                  //   rs.target_currency = rst.channel.targetCurrency[0];
                  //   rs.exchange_rate = rst.channel.exchangeRate[0];
                  //   rs.inverse_rate = rst.channel.inverseRate[0];

                  //   console.log(rs);

                  //   console.log(rs);

                  //   console.log(JSON.stringify(rst['gesmes:Envelope'].Cube));
                  //   console.log(rst['gesmes:Envelope'].Cube[0].Cube);
                  //   console.log('1: ', rst['gesmes:Envelope'].Cube[0].Cube[0].Cube);
                  //   console.log('2: ', rst['gesmes:Envelope'].Cube[0].Cube[0].$);
                }
              });
            },
          ],
          function (error, result) {
            if (error) {
              return res.send(error.error_msg);
            } else {
              param.update_time = result.update_time;
              param.description = result.description;
              param.currency_ar = result.currency_ar;
              param.currency = result.currency_ar.join(', ');
              return res.render('index', { param, layout: false });
              // res.send(
              //   '<div>Exange Rate</div>' +
              //     '<div>Udate time: ' +
              //     result.update_time +
              //     '</div>' +
              //     '<div>Description: ' +
              //     result.description +
              //     '</div>' +
              //     '<div>Support currencies: ' +
              //     result.currency_ar.join(', ') +
              //     '</div>'
              // );
            }
          }
        );
      }
    } catch (e) {
      return res.send('convertCurrency catch in ' + e.toString());
    }
  },
};
