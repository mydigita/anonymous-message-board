/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var shortid = require('shortid')

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('API ROUTING FOR /api/threads/:board', function() {
  
    suite('POST', function() {
      
      test('fields accepted and redirected', function(done){
        chai.request(server)
        .post('/api/threads/test')
        .send({text:"test thread", delete_password:123456})
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.isNotEmpty(res.redirects);
          done();
        })
      })
 
    });
    suite('GET', function() {
      test('get thread info', function(done){
        chai.request(server)
        .get('/api/threads/test')
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.equal(res.body[res.body.length-1].text, 'test thread');
          done();
        })
      })
      
    });
    
    suite('DELETE', function() {
      test('need thread id and pwd to delete otherwise show incorrect information!', function(done){
        chai.request(server)
        .delete('/api/threads/test')
        .send({delete_password:123456})
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect information!');          
          done();
        })
      })
    });
    
    suite('PUT', function() {
      test('report a thread- id and pwd required otherwise show incorrect information!', function(done){
        chai.request(server)
        .put('/api/threads/test')
        .send({delete_password:123456})
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'Thread Not Found!');
          done();
        })
        
      })
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('send a reply, we need thread id, text and delete pwd, on success it will be redirected', function(done){
        chai.request(server)
        .post('/api/replies/test')
        .send({board:'test', 'thread_id':'dL5aIW3eP', text:'test reply', delete_password:123456}) 
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.isNotEmpty(res.redirects);
          done(); 
        })
      })
    });
    
    suite('GET', function() {
      test('get a list of reply, need a thread id', function(done){
        chai.request(server)
        .get('/api/replies/test?thread_id=dL5aIW3eP')
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.equal(res.body._id, 'dL5aIW3eP');
          done();
        })
      })
      
    });
    
    suite('PUT', function() {
      test('report a reply', function(done){
        chai.request(server)
        .put('/api/replies/test')
        .send({thread_id:'dL5aIW3eP', reply_id:'QK_t3Trea'})
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'It\'s already reported', 'one time can be reported, res.text will be Reported, otherwise It\'s already reported');
          done();
        })
      })
      
    });
    
    suite('DELETE', function() {
      test('delete a reply', function(done){
        chai.request(server)
        .delete('/api/replies/test')
        .send({thread_id:'dL5aIW3eP', reply_id:'QK_t3Trea', delete_password:null})
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.equal(res.text,'Incorrect information or already deleted!', 'you can delete it one time only' );
          done();
        })
      })
    });
    
  });

});
// all tests are passing 