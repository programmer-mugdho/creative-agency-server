const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const { ObjectId } = require('mongodb')
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const { DB_NAME, DB_USER, DB_PASS } = process.env
const uri = `mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.wv7ly.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;
const port = 5000

const app = express()
app.use(bodyParser.json())
app.use(fileUpload())
app.use(cors())

app.get('/', (req, res) => {
    res.send("Hello")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db(DB_NAME).collection("services");
    const adminCollection = client.db(DB_NAME).collection("admins");
    const orderCollection = client.db(DB_NAME).collection("orders");
    const reviewCollection = client.db(DB_NAME).collection("feedbacks");

    console.log('Connected')

    app.post('/addOrder', (req, res) => {
        const file = req.files.file
        const encImg = file.data.toString('base64')
        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }
        const { name, detail, email, work, price, status } = req.body
        orderCollection.insertOne({ name, detail, email,status, work, price, image })
            .then(result => {
                return res.send(result.insertedCount > 0)
            })
    })


    app.post('/addService', (req, res) => {
        const file = req.files.file
        const encImg = file.data.toString('base64')
        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        }
        const { title, description } = req.body
        serviceCollection.insertOne({ title, description, image })
            .then(result => {
                return res.send(result.insertedCount > 0)
            })
    })

    app.get('/allReviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.get('/allServices', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.get('/allOrders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.post('/addAdmin', (req, res) => {
        const email = req.body.email
        adminCollection.insertOne({ email })
            .then(result => {
                return res.send(result.insertedCount > 0)
            })
    })

    app.get('/userOrder/:email', (req, res) => {
        const email = req.params.email;
        orderCollection.find({ email })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.patch('/updateOrder', (req, res) => {
        console.log(req.body)
        orderCollection.updateOne({ _id: ObjectId(req.body.id) },
            {
                $set: { status: req.body.status }
            })
            .then(result => {
                console.log(result)
                res.send(result)
            })
    })

    app.post('/addReview', (req, res) => {
        const data = req.body
        console.log(data)
        reviewCollection.insertOne(data)
            .then(result => {
                return res.send(result.insertedCount > 0)
            })
    })
});

app.listen(process.env.PORT || port)
