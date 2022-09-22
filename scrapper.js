var http = require('http');
const e = require('express');
const bodyParser = require('body-parser');
const app = e();
const resultsRouter = require('./routes/results');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/results', resultsRouter);

app.get('/', (req, res) =>{
    res.render('index');
});

app.listen(500);