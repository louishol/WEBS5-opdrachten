var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var session = require('express-session');
var exphbs  = require('express-handlebars');
var flash    = require('connect-flash');

// Models
    var model = {};
    var mongoose = require('./config/database')();
    model.Book = require('./models/book')(mongoose);
    model.Author = require('./models/author')(mongoose);
    model.User = require('./models/user')(mongoose);

    require('./models/fillTestData')(model);
// /Models

// Passport
    var passport = require('./auth/passport')(model.User);
// /Passport

// Role based security
    var roles = require('./auth/connectroles')();
// /Role based security

function handleError(req, res, statusCode, message){
    console.log();
    console.log('-------- Error handled --------');
    console.log('Request Params: ' + JSON.stringify(req.params));
    console.log('Request Body: ' + JSON.stringify(req.body));
    console.log('Response sent: Statuscode ' + statusCode + ', Message "' + message + '"');
    console.log('-------- /Error handled --------');
    res.status(statusCode);
    res.json(message);
};

// Routes
    var routes = require('./routes/index')(passport, roles);
    var books = require('./routes/books')(model, roles, handleError);
    var authors = require('./routes/authors')(model, roles, handleError);
// /Routes

var app = express();

// view engine setup
    app.set('views', path.join(__dirname, 'views/'));
    app.engine('handlebars', exphbs({defaultLayout: 'main'}));
    app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));

// required for passport
    app.use(session({ secret: 'myappsecretisthisstring' })); // session secret
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session
// /required for passport

// required for role based authorization
    app.use(roles.middleware());
// /required for role based authorization

// Routing
    app.use('/', routes);
    app.use('/books', books);
    app.use('/authors', roles.can('access authors'), authors);
// /Routing

// catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        console.log(err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
