const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
      const moviesCollection =moviesDB.collection('movies');
      const watchlistCollection =moviesDB.collection('watchlist');

      app.post('/movies',async(req,res)=>{
        const newMovie =req.body;
        const result = await moviesCollection.insertOne(newMovie);
        res.send(result);
      });

      app.post('/moviesById',async(req,res)=>{
        const ids =req.body;
        const objectIds = ids.map(id => id);
        const qurey ={_id: { $in: objectIds } };
        const cursor =moviesCollection.find(qurey);
        const result = await cursor.toArray();
        res.send(result);
      });

      app.post('/watchlist',async(req,res)=>{
        const movie =req.body;
        console.log(movie);
        const query ={movieId:movie.movieId,email:movie.email};
        const existingMovie =await watchlistCollection.findOne(query);
        if (existingMovie){
            res.send( 'Already added to watchlist')}
        else{
            const result = await watchlistCollection.insertOne(movie);
            res.send(result);
        }});
      app.get('/watchlist',async(req,res)=>{
        const email =req.query.email;
        const qurey ={email:email};
        const cursor =watchlistCollection.find(qurey);
        const result = await cursor.toArray();
        res.send(result);
        
      });
      app.delete('/watchlist/:id',async(req,res)=>{
        const id =req.params.id;
        const qurey = { _id: new ObjectId(id) };
        const result = await watchlistCollection.deleteOne(qurey);
        res.send(result);
      });

      app.get('/movies',async(req,res)=>{
        const cursor =moviesCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });

      app.get('/highRatedMovies',async(req,res)=>{
        const cursor =moviesCollection.find().sort({rating:1}).limit(6);
        const result = await cursor.toArray();
        res.send(result);
      });
      app.get('/latestMovies',async(req,res)=>{
        const cursor =moviesCollection.find().sort({releaseDate:-1}).limit(6);
        const result = await cursor.toArray();
        res.send(result);
      });

      app.get('/moviesById/:id', async (req, res) => {
        try {
          const id = req.params.id; 
          const query = { _id: new ObjectId(id) }; 
          const result = await moviesCollection.findOne(query);
          res.send(result);
        } catch (error) {
          console.error(error);
          res.status(500).send({ error: 'Invalid ID or server error' });
        }
      });
      
      app.put('/movies/:id', async (req, res) => {
        const id = req.params.id;
        const email = req.query.email;    // user email from frontend
        const updatedMovie = req.body;
      
        const filter = { 
          _id: new ObjectId(id),
          email: email                   // only owner can update
        };
      
        const updateDoc = {
          $set: {
            movieName: updatedMovie.movieName,
            photo: updatedMovie.photo,
            rating: updatedMovie.rating,
            publishYear: updatedMovie.publishYear
          }
        };
      
        const result = await moviesCollection.updateOne(filter, updateDoc);
      
        if (result.matchedCount === 0) {
          return res.status(403).send({ message: "Unauthorized!" });
        }
      
        res.send(result);
      });
      
     // app.post('/moviesByCategory',async(req,res)=>{
       // const category =req.body.category;
       // const qurey ={category:category};
      //  const cursor =moviesCollection.find(qurey);
       // const result = await cursor.toArray();
       // res.send(result);
     // });

     //app.get('/moviesByCategory',async(req,res)=>{
       // const category =req.query.category;
        //const qurey ={category:category};
       // const cursor =moviesCollection.find(qurey);
       // const result = await cursor.toArray();
       // res.send(result);
      //});

    //
      app.get('/moviesMycollection',async(req,res)=>{
        const email =req.query.email;
        const qurey ={email:email};
        const cursor =moviesCollection.find(qurey);
        const result = await cursor.toArray();
        res.send(result);
        
      });
      

      app.delete('/movies/:id',async(req,res)=>{
        const id =req.params.id;
        const qurey = { _id: new ObjectId(id) };
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
