//required middleware from npm
var http = require("http");
var Mustache = require("mustache");
var randomNum = require("./randomnumber");

//your code
var message = Mustache.render("Hello, {{firstname}} {{lastname}} how are you today?? ", {firstname:"Jordan", lastname:"Dubreuil"});

//Handle incoming HTTP requests
function reqHandler(req, res){
    console.log("We have a server request from " + req.url);
    if(req.url === "/"){
        res.end("Welcome to my Hompage!");
    }
    else if(req.url === "/about"){
        res.end("This is the about page");
    }
    else if(req.url === "/contact"){
        res.end(message + randomNum());
    }
    else{
        res.end("Page not found");
    }
}

//rendering the result
console.log(message);
console.log(randomNum());
console.log(randomNum());
console.log(randomNum());

//create and start the server
var server = http.createServer(reqHandler);

//starts the server
server.listen(3000);
