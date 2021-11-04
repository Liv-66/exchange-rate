const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');

const ExchangeRateController = require('./controllers/ExchangeRateController.js');

const app = express();
const port = process.env.PORT || 3000;

app.engine(
  'hbs',
  handlebars({
    defaultLayout: 'main.hbs',
  })
);
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(express.static(__dirname + '/public'));

app.get('/', ExchangeRateController.getCurrencyData);
app.post('/api/v1/currencies', ExchangeRateController.convertCurrency);
app.post('/api/v1/currencies/saving', ExchangeRateController.saveCurrency);
app.post('/api/v1/currencies/download', ExchangeRateController.downloadCurrency);
app.post('/api/v1/test', ExchangeRateController.convertTest);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

module.exports = app;
