//require express
var express = require('express');
//require body parser
var bodyParser = require('body-parser');
//require mongoose
var mongoose = require('mongoose');
//require node-fetch
var fetch = require('node-fetch');
//create express object, call express
var app = express();
//gets port information
const port = process.env.PORT || 3000;

//tell application to use EJS for templates
app.set('view engine', 'ejs');
//make styles public
app.use(express.static("public"));
//tell app to use body-parser
app.use(bodyParser.urlencoded({extended: true}));

//Connection Information for Mongo
const Todo = require('./models/todo.model');
const mongoDB =  'mongodb+srv://MikeVita4:YNVrJT6WrH37yMi7@cluster0.jrtxc.mongodb.net/todolist?retryWrites=true&w=majority';
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Couple of items to our list
var tasks = [];
//completed items
var completed = [];

//get home page /
app.get('/', function(req, res){
    //query to mongoDB for todos
    Todo.find(function(err, todo){
        if(err){
            console.log(err);
        }else{
            tasks = [];
            completed = [];
            for(i = 0; i< todo.length; i++){
                if(todo[i].done){
                    completed.push(todo[i])
                }else{
                    tasks.push(todo[i])
                }
            }
        }
    });
    //return something to home page
    res.render('index', {tasks: tasks, completed: completed}); //add completed variable to ejs ex {a:a, b:b}
});

//add POST method /addtask
app.post('/addtask', function(req, res){
    let newTodo = new Todo({
        item: req.body.newtask,
        done: false
    })
    newTodo.save(function(err, todo){
        if (err){
            console.log(err)
        } else {
            //return index
            res.redirect('/');
        }
    });
});

app.post('/removetask', function(req, res){
    var id = req.body.check;
    if(typeof id === 'string'){
        Todo.updateOne({_id: id},{done:true},function(err){
            if(err){
                console.log(err)
            }
        })
    }else if(typeof id === 'object'){
        for (var i = 0; i < id.length; i++){
            Todo.updateOne({_id: id[i]},{done:true},function(err){
                if(err){
                    console.log(err)
                }
                res.redirect('/');
            })
        }
    }
    res.redirect('/');
});

app.post('/deleteTodo', function(req, res){
    var id = req.body.delete;
    if(typeof id === "string"){
        Todo.deleteOne({_id: id}, function(err){
            if (err){
               console.log(err)
            }
        });
    }else if (typeof id === "object"){
        for(var i = 0; i < id.length; i++){
            Todo.deleteOne({_id: id[i]}, function(err){
            if (err){
                console.log(err)
            }
        });
        }
    }
    res.redirect('/');
})

// //fetch nasa information and send to front end as JSON data
// app.get('/nasa', function(req, res){
//     fetch('https://api.nasa.gov/planetary/apod?api_key=vWe1lzJ6A1zzH06D1fZMe5AGzPR2PI6jReBavfSq')
//     .then(res => res.json())
//     .then(data => {
//         res.render('nasa', {data: data});
//     });
// })

//fetch nasa information and send to front end as JSON data
app.get('/nasaRandom', function(req, res){
    //wrote logic for random date
    let date = '2019-12-16'
    fetch('https://api.nasa.gov/planetary/apod?api_key=vWe1lzJ6A1zzH06D1fZMe5AGzPR2PI6jReBavfSq&date=' + date)
    .then(res => res.json())
    .then(data => {
        res.render('nasaRandom', {data: data})
    });
})

//get our data for the todo list from Mongo and send to front end as JSON
app.get('/todoListJson', function(req, res){
    //query to mongoDB for todos
    Todo.find(function(err, todo){
        if(err){
            console.log(err);
        }else{
            res.json(todo);
        }
    });
});

//server setup
app.listen(port, function(){
    console.log('Listening on port ' + port)
});