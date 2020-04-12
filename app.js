const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const Joi = require('@hapi/joi');
const ejs = require('ejs');
const db = require("./db");
const collection = "todo";
const app = express();
const schema = Joi.object().keys({
    todo : Joi.string().required()
});
app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public/css'));
app.use(express.static(__dirname + '/public/images'));
app.get('/',(req,res)=>{
    console.log('rendered index');
   res.render('index');
   console.log('okay with this index');
});

// read
app.get('/getTodos',(req,res)=>{
    db.getDB().collection(collection).find({}).toArray((err,documents)=>{
        if(err)
            console.log(err);
        else{
            res.json(documents);
        }
    });
});


app.put('/:id',(req,res)=>{
    // Primary Key of Todo Document we wish to update
    const todoID = req.params.id;
    // Document used to update
    const userInput = req.body;
    // Find Document By ID and Update
    db.getDB().collection(collection).findOneAndUpdate({_id : db.getPrimaryKey(todoID)},{$set : {todo : userInput.todo}},{returnOriginal : false},(err,result)=>{
        if(err)
            console.log(err);
        else{
            res.json(result);
        }      
    });
});


//create
app.post('/',(req,res,next)=>{
    const userInput = req.body;
    Joi.validate(userInput,schema,(err,result)=>{
                    db.getDB().collection(collection).insertOne(userInput,(err,result)=>{
                if(err){
                    const error = new Error("Failed to insert Todo Document");
                    next(error);
                }
                else
                    res.json({result : result, document : result.ops[0],msg : "Successfully inserted Todo!!!",error : null});
            });
    });   
});



//delete
app.delete('/:id',(req,res)=>{

    const todoID = req.params.id;
    
    db.getDB().collection(collection).findOneAndDelete({_id : db.getPrimaryKey(todoID)},(err,result)=>{
        if(err)
            console.log(err);
        else
            res.json(result);
    });
});
app.use((err,req,res,next)=>{
    res.status(err.status).json({
        error : {
            message : err.message
        }
    });
});
const Port=3000 || 25892 || process.env.PORT;
        app.listen(3000 || 25892 || process.env.PORT,()=>{
             console.log('connected to database, app listening on ${PORT} ');
        });