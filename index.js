const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p8oa6.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const productCollection = client.db('as_sunnah').collection('products');
        const cartCollection = client.db('as_sunnah').collection('cart');

        app.get('/product',async(req,res)=>{
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        })
        app.get('/product/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await productCollection.findOne(query);
            res.send(product);
        })
        app.put('/product/:id',async(req,res)=>{
            const id = req.params.id;
            const updateQuantity = req.body;
            const filter = {_id: ObjectId(id)};
            const options = {upsert:true};
            const updatedDoc = {
                $set: {
                    quantity: updateQuantity.availableQuantity
                }
            };
            const result = await productCollection.updateOne(filter,updatedDoc,options);
            res.send(result);

        })
        app.get('/cart',async (req,res)=>{
            const query = {};
            const cursor = cartCollection.find(query);
            const cart = await cursor.toArray();
            res.send(cart);
         })
         app.get('/cart/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const product = await cartCollection.findOne(query);
            res.send(product);
        })
         
        app.post('/cart',async (req,res)=>{
            const newCart = req.body;
            console.log(req.body);
            const result = await cartCollection.insertOne(newCart);
            res.send(result);
        })
       
        app.delete('/cart/:id',async (req,res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)};
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })

    }
    finally{

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Welcome to As Sunnah')
})

app.listen(port, () => {
    console.log(`As_Sunnah is running on ${port}`)
})