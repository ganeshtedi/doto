const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const Joi = require('@hapi/joi');
const db = require("./db");
const collection = "todo";
const app = express();
const schema = Joi.object().keys({
    todo : Joi.string().required()
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/',(req,res)=>{
    console.log('rendered index');
    res.sendFile(path.join(__dirname+'/views/index.html'));
   //res.render('index');
  // res.sendFile('index.html');
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
const PORT = process.env.PORT || 5001 || 8080;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));
