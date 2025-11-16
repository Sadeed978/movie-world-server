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
      const usersCollection =usersDB.collection('users')
      const database = client.db("AllMovies");
      const moviesCollection = database.collection("movies");
      
      app.post('/Movies',async(req,res)=>{
         const newMovies =req.body;
         const result = await moviesCollection.insertOne(newMovies);
         res.send(result);
      })
      app.post('/users',async(req,res)=>{
        const newUser =req.body;
        const email =req.body.email;
        const qurey ={email:email}
        const existingUser =await usersCollection.findOne(qurey)
        if (existingUser){
            res.send( 'Already exist')
        }else{
            const result = await usersCollection.insertOne(newUser);
        res.send(result);
        }

     })

      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      
      await client.close();
    }
  }
  run().catch(console.dir);

app.listen(port, () => {
  console.log(`movie-world-server listening on port ${port}`)
})
