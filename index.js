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


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGOD_URL;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// jwt verify funtion in middleware

async function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    // console.log("authHeader", authHeader)
    if (!authHeader) {
        return res.status(401).send("unauthorized access")
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_TOKEN, function (err, decoded) {
        if (err) {
            res.status(403).send("forbidden access")
        }
        req.decoded = decoded;
        next()
    })
}




async function run() {
    try {
        await client.connect(err => {
            if (err) {
                console.log(`${err}`.red)
            } else {
                console.log("no error".bgBlue)
            }
        });

    }
    catch {
        (error) => {
            console.log(error)
        }
    }
}

run()



const ShopEaseCollection = client.db("ShopEaseAssessment").collection("products");
const SaveProductsCollection = client.db("ShopEaseAssessment").collection("products");
const usersCollection = client.db("ShopEaseAssessment").collection("users");


app.put('/jwt', async(req, res)=> {
    const email = req.query?.email;
    const userInfo = req.body;

    const filter = {email: email}
    const options ={upsert: true};
    const updateDoc = {
        $set: userInfo,
    }
    const result = await usersCollection.updateOne(filter, updateDoc, options);
    // console.log(result)

    // token generate
    const token = jwt.sign(
        {email: email},
        process.env.JWT_TOKEN,
        { expiresIn: "1d" }
    )
    // console.log("token", token)

    res.send({
        status: "success",
        message: "Token Created Successfully",
        data: token
    })

    
})

app.get('/products', verifyJWT, async (req, res) => {
    try {
        // console.log("products", req.headers.authorization)
        const body = {};
        const products = await ShopEaseCollection.find(body).toArray();
        if (products) {
            res.send({
                success: true,
                data: products
            })
        } else {
            res.send({
                success: false,
                message: `Your are wrong enpoint. plz correct your enpoints`
            })
        }
    }
    catch {
        (error) => {
            console.log(`${error.message}`.red)
            res.send({
                success: false,
                message: error.message
            })
        }
    }
})


app.post('/products', async (req, res) => {
    try {
        const body = req.body;
        // console.log(body)
        const result = await SaveProductsCollection.insertOne(body)
        // console.log(result)
        if (result.acknowledged) {
            res.send({
                success: true,
                message: `successfully added the product ${result.insertedId}`
            })
        } else {
            res.send({
                success: false,
                message: `Cound't Product`
            })
        }
    }
    catch {
        (error) => {
            console.log(`${error.message}`.red)
            res.send({
                success: false,
                message: error.message
            })
        }
    }
})


// Get the specifed saved the Product
app.get('/userProduct', verifyJWT,  async (req, res) => {
    try {
        const query = req.query;
        console.log(query)
        const result = await SaveProductsCollection.find(query).toArray();
        console.log(result)
        if(result){
            res.send({
                success: true,
                data: result
            })
        }else{
            res.send({
                success: false,
                message: `cound't found in database`
            })
        }
    }
    catch {
        (error) => {
            console.log(`${error.message}`.red)
        }
    }
})






app.listen(port, () => {
    client.connect(err => {
        if (err) {
            console.log(`${err}`.red)
        } else {
            console.log("no error".bgBlue)
        }
    });
    console.log(`ShopEase server is running ${port}`.brightCyan)
})



