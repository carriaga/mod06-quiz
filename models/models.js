// Inicialización del modelo

var path = require('path');

// Conexiones a BD
// Postgres DATABASE_URL = postgres://user:passwd@hots:port/database
// SQLite	DATABASE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name = (url[6]||null);
var user = (url[2]||null);
var pwd = (url[3]||null);
var protocol = (url[1]||null);
var dialect = (url[1]||null);
var port = (url[5]||null);
var host = (url[4]||null);
var storage = process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

// Usar BD SQLite o Postgres
var sequelize = new Sequelize(DB_name, user, pwd,
		{ 
		dialect:	dialect,
		protocol:	protocol,
		port:		port,
		host: 		host,
		storage: 	storage, // solo SQLite (.env)
		omitNull: 	true
			}
	);

// Importar la definición de la tabla Quiz de quiz.js
var Quiz = sequelize.import(path.join(__dirname, 'quiz'));

// Importar definición de la tabla Comment
var comment_path = path.join(__dirname, 'comments');
var Comment = sequelize.import(comment_path);

Comment.belongsTo(Quiz);
Quiz.hasMany(Comment);

exports.Quiz = Quiz; // exportar definición de tabla Quiz
exports.Comment = Comment;

// sequelize.sync() crea e inicializa tabla de preguntas en BD
sequelize.sync().then(function() {
	// success(..) ejecuta el manejador una vez creada la tabla
	Quiz.count().then(function (count) {
		if(count === 0) { // la tabla se inicializa sólo si está vacía
			Quiz.create({ pregunta: 'Capital de Italia',
						  respuesta: 'Roma',
						  tema: 'humanidades'});
			Quiz.create({ pregunta: 'Capital de Portugal',
						  respuesta: 'Lisboa',
						  tema: 'ocio'	
						})
			.then(function() {console.log('Base de datos inicializada')});
		}
	})
});
