const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.port||3000

app.use (cors());
app.use(express.json());
const uri= `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bhxscno.mongodb.net/?appName=Cluster0`

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

app.get('/', (req, res) => {
  res.send('movie-world-server is runnging')
})

async function run() {
    try {
      await client.connect();
      const usersDB = client.db('users');
      const usersCollection =usersDB.collection('users');
      const moviesDB = client.db('movies');
      const moviesCollection =moviesDB .collection('movies');

      app.post('/movies',async(req,res)=>{
        const newMovie =req.body;
        const result = await moviesCollection.insertOne(newMovie);
        res.send(result);
      });

      app.get('/movies',async(req,res)=>{
        const cursor =moviesCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });

      app.get('/moviesById',async(req,res)=>{
        const id =req.query.id;
        const qurey ={_id:id};
        const result = await moviesCollection.findOne(qurey);
        res.send(result);
      });

     /app.put('/movies/:id',async(req,res)=>{
        const id =req.params.id;
        const updatedMovie =req.body;
        const filter ={_id:id};
        const options ={upsert:true};
        const updateDoc ={
            $set:{
                title:updatedMovie.title,
                director:updatedMovie.director,
                genre:updatedMovie.genre,
                releaseYear:updatedMovie.releaseYear,
                rating:updatedMovie.rating,
                posterUrl:updatedMovie.posterUrl
            },
        };
        const result = await moviesCollection.updateOne(filter,updateDoc,options);
        res.send(result);
     });

      app.delete('/movies/:id',async(req,res)=>{
        const id =req.params.id;
        const qurey ={_id:id};
        const result = await moviesCollection.deleteOne(qurey);
        res.send(result);
      });
      
      app.post('/users',async(req,res)=>{
        const newUser =req.body;
        const email =req.body.email;
        const qurey ={email:email};
        const existingUser =await usersCollection.findOne(qurey);
        if (existingUser){
            res.send( 'Already exist')
        }else{
            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        }
        
     });

      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      
     
    }
  }
  run().catch(console.dir);

app.listen(port, () => {
  console.log(`movie-world-server listening on port ${port}`)
})
