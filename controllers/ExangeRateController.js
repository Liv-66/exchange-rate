const axios = require('axios');
const xml2js = require('xml2js');
const async = require('async');

parser = new xml2js.Parser();

module.exports = {
  getCurrencyData: (req, res) => {
    try {
      let rs = {};
      async.waterfall(
        [
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
          (rs, next) => {
            parser.parseString(rs.data, (err, rst) => {
              if (err) {
                rs.error_msg = err.toString();
                next(rs);
              } else {
                //   console.log(JSON.stringify(rst.channel.item[0]));
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
            res.send(error.error_msg);
          } else {
            res.send(
              '<div>Exange Rate</div>' +
                '<div>Udate time: ' +
                result.update_time +
                '</div>' +
                '<div>Description: ' +
                result.description +
                '</div>' +
                '<div>Support currencies: ' +
                result.currency_ar.join(', ') +
                '</div>'
            );
          }
          console.log('error: ', error);
          console.log('result: ', result);
        }
      );
    } catch (e) {
      res.send('getCurrencyData catch in ' + e.toString());
    }
  },
};
