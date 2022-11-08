const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.rzk36ti.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        const serviceCollection = client.db('FOODIGO').collection('services');

        const reviewCollection = client.db('FOODIGO').collection('reviews');
        
        // create services API
        app.post('/services', async(req, res) => {
            const query = req.body;
            const result = await serviceCollection.insertOne(query);
            res.send(result);
        });

        // read services API
        // loading server data for client site
        app.get('/services', async(req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })
    }
    finally{

    }
}
run().catch( error => console.error(error))

app.get('/', (req, res) => {
    res.send('FOODIGO server is running')
});

app.listen(port, () => {
    console.log(`FOODIGO server running on ${port}`);
})