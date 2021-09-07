const express = require('express');
const ExangeRateController = require('./controllers/ExangeRateController.js');

const app = express();
const port = 3000;

app.post('/', ExangeRateController);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
