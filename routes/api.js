/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var shortid = require("shortid");
const ObjectID = require("mongodb").ObjectID;

// export to server
module.exports = function (app, db) {
const messages = db.db("test").collection("pro5messages");  
  

  app.route('/api/threads/:board')
  .get((req, res)=>{
    var board = req.params.board;
    messages.find({board},
                  {projection:{"thread.reported":0, "thread.delete_password":0, "thread.replies.reported":0, "thread.replies.delete_password":0}})
      .sort({bumped_on:-1})
      .limit(10)
      .toArray((err, doc)=>{    
       if(!doc.length){
        res.json({error:"Requested board was not found"})
      }else {
       res.json(doc[0].thread)
      }
    })
   
  })
  .post((req, res)=>{
    const {text, delete_password}=req.body;
    const board =  req.params.board;
    const thread = {
      _id:shortid.generate(),
      text,
      delete_password,
      created_on:new Date(),
      bumped_on:new Date(),
      reported:false,
      replies:[],
      replycount:0
    }
    messages.updateOne({board}, {$push:{thread}}, {upsert:true});    
    res.redirect(`/b/${board}`);
       
  })
  .put((req, res)=>{
    const {thread_id}= req.body;
    const {board} = req.params;
    messages.updateOne({board,"thread._id":thread_id}, {$set:{"thread.$.reported":true}}, (err, data)=>{
      if(data.matchedCount==0){
        res.send("Thread Not Found!")
      }else if(data.matchedCount==1 && data.modifiedCount==0){
        res.send("Requested Thread is already reported!")
      }else{
        res.send("Reported Successfully!")
      }
    });    
  })
  .delete((req, res)=>{
    const {thread_id, delete_password}= req.body;
    const {board}=req.params;
    messages.updateOne({board, "thread._id":thread_id, "thread.delete_password":delete_password},{$pull:{thread:{_id:thread_id}}}, (err, data)=>{
       if(data.modifiedCount==1){
        res.send("Requested Thread was deleted successfully!")
      }else{
        res.send("incorrect information!")
      }
    })  
  })
 
    // everything is ok upto this point
  
  
  app.route('/api/replies/:board')
  .get((req, res)=>{
    const board = req.params.board;
    const {thread_id}=req.query;
    messages.findOne({board, "thread._id":thread_id}, 
                     {projection: {"thread.replies.reported":0, "thread.replies.delete_password":0}}, 
                     ((err, doc)=>{
                     if(!doc){
                       res.json({error:"Thread was not found"})
                     }else{
                       let result = doc.thread.filter((e)=>{return e._id===thread_id});
                       res.json(result[0])
                     }
                     }));
  })
  .post((req, res)=>{
  const {thread_id, text, delete_password}= req.body;
    const {board} = req.params;
    const reply = {
      _id:shortid.generate(), 
      text, 
      created_on:new Date(),
      delete_password,
      reported:false
    };
    messages.updateOne({board, "thread._id":thread_id}, 
                       {$set:{"thread.$.bumped_on": new Date()},
                        $push:{"thread.$.replies":reply}, 
                        $inc:{"thread.$.replycount":1}}, (err, data)=>{
     
      if(data.modifiedCount>0){
        res.redirect(`/b/${board}/${thread_id}`)
      }else{
        res.send("Board/Thread not matched")
      }
    })
  })
    .put((req, res)=>{
    const {thread_id, reply_id}= req.body;
    const {board}=req.params;
    messages.updateOne({board, "thread._id":thread_id, "thread.replies._id":reply_id}, 
                       {$set:{"thread.$.replies.$[e].reported":true}},{arrayFilters:[{"e._id":reply_id}], upsert:false}, 
                       (err, data)=>{
      if(data==null){
        res.send("incorrect information")
      }else{
        if(data.modifiedCount>0){
          res.send("Reported");
        }else if(data.matchedCount>0 && data.modifiedCount ==0){
          res.send("It's already reported");
        }else{
          res.send("Incorrect Information");
        }
      }
    })
  })
    .delete((req, res)=>{
    const {thread_id, reply_id, delete_password}= req.body;
    const {board}=req.params;
    messages.updateOne({board, "thread._id":thread_id, "thread.replies._id":reply_id, "thread.replies.delete_password":delete_password}, 
                       {$set:{"thread.$.replies.$[e].text":"[...this message was deleted]"}},{arrayFilters:[{"e._id":reply_id, "e.delete_password":delete_password}], upsert:false}, 
                       (err, data)=>{
      if(data==null){
        res.send("incorrect information!")
      }else{
        if(data.modifiedCount>0){
          res.send("Deleted!");
        }else if(data.matchedCount>0 && data.modifiedCount ==0){
          res.send("Incorrect information or already deleted!");
        }else{
          res.send("Incorrect Information!");
        }
      }
    })
  });
};
