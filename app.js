const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');

const ExangeRateController = require('./controllers/ExangeRateController.js');

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

app.get('/', ExangeRateController.getCurrencyData);
app.post('/convert', ExangeRateController.convertCurrency);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
