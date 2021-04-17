const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload')
const ObjectID = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7wr7p.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());

app.use(express.static('services'));
app.use(fileUpload());
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Hello World! i am db')
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const serviceCollection = client.db("drTailor").collection("services");
    const reviewCollection = client.db("drTailor").collection("reviews");
    const bookingCollection = client.db("drTailor").collection("bookings");
    const adminCollection = client.db("drTailor").collection("admins");

    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const cost = req.body.cost;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        serviceCollection.insertOne({ name, image, cost })
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.post('/addAdmin', (req, res) => {
        const admin = req.body;
        adminCollection.insertOne(admin)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })


    app.post('/addReview', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;
        const address = req.body.address;
        const newImg = file.data;
        const encImg = newImg.toString('base64');
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        reviewCollection.insertOne({ name, image, description, address })
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.post('/addBooking', (req, res) => {
        const order = req.body;
        bookingCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/services', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })
    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    app.get('/service/:id', (req, res) => {
        serviceCollection.find({ _id: ObjectID(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0]);
            })
    })

    app.get('/ordered', (req, res) => {
        bookingCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.get('/allOrders', (req, res) => {
        bookingCollection.find()
          .toArray((err, items) => {
            res.send(items)
          })
      })


    app.get('/admin', (req, res) => {
        adminCollection.find({ email: req.query.email })
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/allAdmins', (req, res) => {
        adminCollection.find()
          .toArray((err, items) => {
            res.send(items)
          })
      })
      
      app.delete('/delete/:id', (req, res) => {
        serviceCollection.deleteOne({ _id: ObjectID(req.params.id) })
          .then(result => {
            console.log(result)
          })
      })

      app.patch('/updateStatus/:id', (req, res)=>{
          bookingCollection.updateOne({_id: ObjectID(req.params.id) },
            {
                $set: { status: req.body.status}
            })
            .then(result => {
                res.send(result.modifiedCount > 0)
            })
      })

});





app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})