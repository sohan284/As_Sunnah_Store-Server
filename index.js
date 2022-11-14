const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p8oa6.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'UnAuthorised access'});
    }
}

async function run(){
    try{
        await client.connect();
        const productCollection = client.db('as_sunnah').collection('products');
        const cartCollection = client.db('as_sunnah').collection('cart');
        const userCollection = client.db('as_sunnah').collection('users');

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
         app.post('/cart',async (req,res)=>{
            const cart = req.body;
            const result = await cartCollection.insertOne(cart);
            res.send(result);
        })
         app.get('/cart/:mail',async(req,res)=>{
            const email = req?.params?.mail;
            const query = { user: email };
            const cursor =cartCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })
        app.delete('/cart/:id',async (req,res)=>{
            const _id = req.params.id
            const query = {_id: _id};
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })
       
        app.get('/user',verifyJWT,async (req,res)=>{
            const users = await userCollection.find().toArray();
            res.send(users);
         })
         app.put('/user/:email',async(req,res)=>{
            const email = req.params.email;
            const user = req.body;
            const filter = {email: email};
            const options = {upsert: true};
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter,updateDoc,options);
            const token = jwt.sign({email : email},process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h' })
            console.log(token)
            const value ={result,token}
            res.send(value);
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