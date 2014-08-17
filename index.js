var express = require('express')
var app = express();
var pg = require('pg');

pg.connect(process.env.DATABASE_URL, function(err, client,done){
    client.query('SELECT * FROM mytable', function(err, result){
        done();
        if(err) return console.error(err);
        console.log(result.rows);
    });
});

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function(request, response) {
        console.log('this is a log from my app');
        response.write('<html><head/><body>');
        response.write('<strong>Hello World!</strong>');
        response.write('<strong>');
        response.write(process.env.TEST_ENV);
        response.write('</strong>');
        response.write('</body></html>');
        response.end();
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
