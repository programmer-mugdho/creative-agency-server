const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
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
    console.log('Connected')

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
                console.log(result)
            })
        return res.send({ name: file.name })
    })

    app.post('/addAdmin', (req, res)=>{
        const email = req.body.email
        adminCollection.insertOne({email})
            .then(result => {
                console.log(result)
            })
        return res.send({ email })
    })
});

app.listen(process.env.PORT || port)
