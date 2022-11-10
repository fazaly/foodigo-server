const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

// json web token
const jwt = require('jsonwebtoken');

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

        // json web token
        function verifyJWT(req, res, next){
            // console.log(req.headers.authorization)
            const authHeader = req.headers.authorization;
            if(!authHeader){
                return res.status(401).send({message: 'unauthorized access'})
            }
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(error, decoded) {
                if(error){
                    return res.status(403).send({message: 'Forbidden access'})
                }
                req.decoded = decoded;
                next();
            })
        }

         // create json web token API 
        app.post('/jwt', (req, res) => {
            const user = req.body;
            // console.log(user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'});
            // if you want to send token as a actual json you have to convert it as an object
            res.send({token});
        })
        
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
            const services = await cursor.limit(3).toArray();
            res.send(services);
        });

        // read services API
        // get used for finding server data
        // load individual or specific id for services 
        app.get('/services/:id', async(req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = {_id: ObjectId(id)};
            const cursor = serviceCollection.find(query);
            const service = await cursor.toArray();
            res.send(service);
        });

        // read services API
        // loading server data for client site
        app.get('/all-services', async(req, res) => {
            const query = {}
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        });

        // create reviews API
        app.post('/reviews', async(req, res) => {
            const query = req.body;
            const result = await reviewCollection.insertOne(query);
            res.send(result);
        });

        // read data
        app.get('/reviews', async(req, res) => {
            const query = {}
            const cursor = reviewCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        app.get('/review', verifyJWT, async (req, res) => {

            // json web token
            console.log(req.headers.authorization);
            const decoded = req.decoded;
            console.log('inside reviews API', decoded);
            if(decoded.email !== req.query.email){
                res.status(403).send({message: 'unauthorized access'})
            }

            // console.log(req.query.email);
            let query = {};
            // loading data by using query parameters
            if(req.query.email){
                query = {
                    email: req.query.email
                }
            }

            // const query = {}
            const cursor = reviewCollection.find(query)
            const review = await cursor.toArray()
            res.send(review)
        });

        // delete single data
        app.delete('/review/:id', verifyJWT, async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const remain = await reviewCollection.deleteOne(query)
            res.send(remain)
        });

        // Update data
        app.get("/myreviews/:id", verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await reviewCollection.findOne(query)
            res.send(result)
        });

        // update 
        app.patch('/review/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const query = req.body;
            const filter = { _id: ObjectId(id) }
            const updateDoc = {
                $set: query
            }
            const result = await reviewCollection.updateOne(filter, updateDoc)
            res.send(result);
        });
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