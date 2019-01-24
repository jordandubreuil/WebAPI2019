var express = require("express");
var path = require("path");
var http = require("http");
te
var app = express();

app.set("views", path.resolve(__dirname, "views"));

app.get("/", function(req,res){
    res.render(index.html);
});

http.createServer(app).listen(3000, function(){
    console.log("Server Running on port 3000");
});

