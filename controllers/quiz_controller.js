var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find({
					where: {id: Number(quizId)},
					include: [{model: models.Comment}]
		}).then(function(quiz) {
		if (quiz) {
			req.quiz = quiz;
			next();
		} else {next(new Error('No existe quizId=' + quizId));}
	}).catch(function(error) {next(error);});
};

// GET /quizes
exports.index = function(req, res) {

	var funcion_quizes = function(quizes) {
		res.render('quizes/index.ejs', { quizes: quizes.sort(), errors: []});
	}
	
	if(req.query.search === undefined) {
		// Devolver todas las preguntas.
		models.Quiz.findAll().then(funcion_quizes);
	}
	else {
		// Devolver las buscadas.
		var filter = '%' + req.query.search.replace(/ /g, '%') + '%';
		
		models.Quiz.findAll({where: ["pregunta like ?", filter]}).
			then(funcion_quizes);		
	}
};

// GET /quizes/:quizId
exports.show = function(req, res) {
	res.render('quizes/show', { quiz: req.quiz, errors: [] });
};

// GET /quizes/:quizId/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
	
	if(req.query.respuesta === req.quiz.respuesta) {
		resultado = 'Correcto';
	} 

	res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: [] });
};

// GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build( // Crear un objeto quiz no persistente
			{pregunta: 'Pregunta', respuesta: 'Respuesta', tema: 'otro'}
			);
			
	res.render('quizes/new', { quiz: quiz, errors: [] });
};

// POST /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build( req.body.quiz	);
	
	quiz.validate().then(
		function(err) {
			if (err) {
				res.render('/quizes/new', {quiz: quiz, errors: err.errors});
			} else {
				// guarda en DB los campos pregunta y respuesta de quiz
				quiz.save({fields: ["pregunta", "respuesta", "tema"]}).then(function() {
					res.redirect('/quizes');
				}) // Redirección HTTP (URL relativo) lista de preguntas.
			}
		}
	);
};

//GET /quizes/:quizId/edit
exports.edit = function(req, res) {
	var quiz = req.quiz; // autoload de instancia de quiz
			
	res.render('quizes/edit', { quiz: quiz, errors: [] });
};

// PUT /quizes/:quizId
exports.update = function(req, res) {
	var quiz = req.quiz; // autoload de instancia de quiz
	
	quiz.pregunta = req.body.quiz.pregunta;
	quiz.respuesta = req.body.quiz.respuesta;
	quiz.tema = req.body.quiz.tema;
	
	quiz.validate().then(
		function(err) {
			if (err) {
				res.render('/quizes/edit', {quiz: quiz, errors: err.errors});
			} else {
				// guarda en DB los campos pregunta y respuesta de quiz
				quiz.save({fields: ["pregunta", "respuesta", "tema"]}).then(function() {
					res.redirect('/quizes');
				}) // Redirección HTTP (URL relativo) lista de preguntas.
			}
		}
	);
};

// DELETE /quizes/:quizId
exports.destroy = function(req, res) {
	req.quiz.destroy().then(function() {
		res.redirect('/quizes');
	}).catch(function(error) {next(error)});
};
