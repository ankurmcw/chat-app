var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');
var dbUrl = 'mongodb://user:password123@ds217351.mlab.com:17351/chat-app';
var Message = mongoose.model('Message', {
    name: String,
    message: String
});

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/messages', (req, res) => {
    Message.find({}, (err, messages) => {
        res.send(messages);
    });
});

app.get('/messages/:user', async (req, res) => {
    try {
        var user = req.params.user;
        var message = await Message.findOne( {name: user} );
        if (message)
            res.send(message);
        else
            res.sendStatus(404);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

app.post('/messages', async (req, res) => {
    try {
        console.log('Request received: ', req.body);
        var message  = new Message(req.body);
        await message.save();
        console.log('Message persisted to mongoose');
        var censored = await Message.findOne({message: 'badword'});
        if (censored) {
            console.log('censored word found', censored);
            await Message.deleteOne({ _id: censored.id });
        } else
            io.emit('message', req.body);
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(500);
        return console.log(e);
    }
});

// function using Promise chaining
// app.post('/messages', (req, res) => {
//     console.log('Request received: ', req.body);
//     var message  = new Message(req.body);
//     message.save()
//     .then(() => {
//         console.log('Message persisted to mongoose');
//         return Message.findOne({message: 'badword'});
//     })
//     .then(censored => {
//         if (censored) {
//             console.log('censored words found', censored);
//             return Message.deleteOne,({_id: censored.id});
//         }
//         io.emit('message', req.body);
//         res.sendStatus(200);
//     })
//     .catch(e => {
//         res.sendStatus(500);
//         return console.log(e);
//     });
// });

io.on('connection', (socket) => {
    console.log('a user has connected');
});

mongoose.connect(dbUrl, {useNewUrlParser: true}, (err)=> {
    if (err) {
        console.log('Error while connecting to mongoose');
    } else {
        console.log('Connected successfully to mongoose');
    }
});

var server = http.listen(3000, () => {
    console.log('server listening on port ', server.address().port);
});