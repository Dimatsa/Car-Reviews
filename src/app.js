const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const PORT = process.env.PORT || 3000;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
// TODO: set environment variables and replace test DB
const connectionString = 'mongodb+srv://server:' + MONGO_PASSWORD +
    '@car-reviews-vywlg.mongodb.net/test?retryWrites=true&w=majority';

// Establishes connection with the database
MongoClient.connect(connectionString, {
    useUnifiedTopology: true
}, (err, client) => {
    if (err) throw err;
    console.log('Connected to the database');
    const db = client.db('car-reviews');
    const cars = db.collection('cars');

    app.use(bodyParser.urlencoded({ extended: true }));

    // Sending back the index page
    app.get('/', (req, res, next) => {
        res.sendFile(__dirname + '/frontend/index.html');
    });

    // Search for a car
    app.get('/cars', (req, res, next) => {
        const make = req.query.make;
        const model = req.query.model;
        cars.findOne(
            { $and: [{ "make": make }, { "model": model }] },
            { "make": 1, "model": 1, "reviews": 1 })
            .then(result => {
                if (result) {
                    console.log(`Found ${result.make} ${result.model} in database`);
                    res.send(result.reviews);
                } else {
                    console.log(`No ${make} ${model} in database`);
                    res.status(404).send(`There are no reviews for the ${make} ${model} in the database.`);
                }
            })
            .catch(err => console.error(`Failed to find car: ${err}`));
    });

    // Adding a car review
    app.post('/cars', (req, res, next) => {
        const make = req.body.make;
        const model = req.body.model;
        const review = req.body.review;
        cars.findOneAndUpdate(
            { $and: [{ "make": make }, { "model": model }] },
            { $push: { reviews: review } },
            {
                projection: { "make": 1, "model": 1, "reviews": 1 },
                returnNewDocument: true
            },
            (err, doc) => {
                if (err) { throw err }
                else if (!doc.value) {
                    cars.insertOne({ "make": make, "model": model, "reviews": [review] });
                }
                console.log(`Added review for ${make} ${model} in database`);

                if (doc.value) {
                    res.send(doc.value.reviews);
                } else {
                    res.send([review]);
                }
            });
    });

    app.listen(PORT, () => {
        console.log(`Listening on port ${PORT}`);
    });

});

const getReviewString = (reviews) => {
    let reviewString = '';
    reviews.forEach(element => {
        reviewString += element;
        reviewString += '\n';
    });
    return reviewString;
}