const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
var colors = require('colors');


// middle ware
app.use(cors())
app.use(express.json())


// start ====>
app.get('/', (req, res) => {
    res.send('ShopEase server is running')
})

// 60FaF4weAZTW2UhI
// ShopEaseAssessment



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGOD_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run () {
    try{
       await client.connect(err => {
            if(err){
              console.log(`${err}`.red)
            }else{
                console.log("no error".bgBlue)
            }
           });

    }
    catch{(error)=>{
        console.log(error)
    }}
}

run()



const ShopEaseCollection = client.db("ShopEaseAssessment").collection("products");


app.get('/products', async(req, res)=>{
    try{
        const body = {};
        const products = await ShopEaseCollection.find(body).toArray();
        if(products){
            res.send({
                success: true,
                data: products
            })
        }else{
            res.send({
                success: false,
                message: `Your are wrong enpoint. plz correct your enpoints`
            })
        }
    }
    catch{(error)=> {
        console.log(`${error.message}`.red)
        res.send({
            success: false,
            message: error.message
        })
    }}
})


app.post('/products', async(req, res)=> {
    try{
        const body = req.body;
        console.log(body)
        const result = await ShopEaseCollection.insertOne(body)
        console.log(`${result}`.blue)
        if(result){
            res.send({
                success: true,
                message: `Successfully saved the cart. Model No. ${body.model} `
            })
        }else{
            res.send({
                error: false,
                message: `Cound't saved the product`
            })
        }
    }
    catch{(error)=> {
        console.log(`${error.message}`.red)
        res.send({
            success: false,
            message: error.message
        })
    }}
})






app.listen(port, () => {
    client.connect(err => {
        if(err){
          console.log(`${err}`.red)
        }else{
            console.log("no error".bgBlue)
        }
       });
    console.log(`ShopEase server is running ${port}`.brightCyan)
})



