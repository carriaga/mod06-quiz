var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var partials = require('express-partials');
var methodOverride = require('method-override');
var session = require('express-session');

var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(partials());
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser('Quiz 2015'));
app.use(session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Autologout
app.use(function(req, res, next){
	var expirado = false;
	
	if(req.session.user){
		console.log('Usuario en session: ' + req.session.user.username);
		if(req.session.fechaUltimoAcceso) {
			var fechaAccesoActual = new Date();
			var ultimoAcceso = new Date(req.session.fechaUltimoAcceso);
			
			console.log('Último acceso: ' + ultimoAcceso);
			console.log('Acceso actual: ' + fechaAccesoActual);
			
			// Comprobar el tiempo transcurrido desde el acceso anterior.
			var lapso = (fechaAccesoActual - ultimoAcceso) / 1000; 
			console.log('Lapso (s): ' + lapso);
			
			if(lapso > 5) {
				var expirado = true;
				console.log('La sesión ha expirado');

				// Hacer visible req.session en las vistas.
				res.locals.session = req.session;
				
				var sessionController = require('./controllers/session_controller');
				sessionController.destroy(req, res);
		
			} else {
				req.session.fechaUltimoAcceso = fechaAccesoActual;
				console.log('Nuevo acceso a la sesión en el plazo autorizado: ' + req.session.fechaUltimoAcceso);
			}
			
		} else {
			req.session.fechaUltimoAcceso = new Date();
			console.log('Primer acceso a la sesión: ' + req.session.fechaUltimoAcceso);
		}
		
		var hora = new Date();
	}
	else {
		console.log('Fuera de sesión');
	}
	
	if(!expirado) {
		next();
	}
});

// Helpers dinámicos.
app.use(function(req, res, next){
	
	// guardar path en session.redir para usar tras login/logout
	if(!req.path.match(/\/login|\/logout/)) {
		req.session.redir = req.path;
	}
	
	// Hacer visible req.session en las vistas.
	res.locals.session = req.session;
	next();
});

app.use('/', routes);

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
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err, 
            errors: []
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}, 
        errors: []
    });
});


module.exports = app;
