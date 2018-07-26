var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    methodOverride  = require("method-override"),
    expressSanitizer= require("express-sanitizer");

//APP config    
mongoose.connect('mongodb://localhost:27017/restful_blog_app', { useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//Mongoose.model config
var blogSchema = new mongoose.Schema({
    title:String,
    image:String,
    body:String,
    created:{type:Date, default:Date.now}
});
var Blog = mongoose.model("Blog",blogSchema);

// Blog.create ({
//     title:"First Blog",
//     image:"https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=2866033740,764312663&fm=27&gp=0.jpg",
//     body:"Hello everyone! Really nice to meet you. This is my first blog."
// });

//RESTful routes
app.get("/",function(req,res){
    res.redirect("/blogs");
});

//Index route
app.get("/blogs",function(req,res){
    Blog.find({},function(err,blogs){
        if (err) {
            console.log(err);
        } else {
            res.render("index",{blogs:blogs});
        }
    });
});

//New route
app.get("/blogs/new",function(req, res) {
    res.render("new");
});

//Create route
app.post("/blogs",function(req,res){
    //create blog
    req.body.blog.body = req.sanitizer(req.body.blog.body);
    Blog.create(req.body.blog, function(err, newBlog){
        if(err) {
            console.log(err);
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

//Show route
app.get("/blogs/:id",function(req, res) {
    Blog.findById(req.params.id, function(err,foundBlog){
        if(err) {
            res.render("/blogs");
        } else {
            res.render("show", {blog:foundBlog});
        }
    });
});

//Edit route
app.get("/blogs/:id/edit",function(req, res) {
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.render("edit",{blog:foundBlog});
        }
    });
});

//Update route
app.put("/blogs/:id",function(req,res){
    req.body.blog.body = req.sanitizer(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updateBlog){
        if(err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//Delete route
app.delete("/blogs/:id", function(req,res){
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        }
    });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("The Server Has Started!");    
});