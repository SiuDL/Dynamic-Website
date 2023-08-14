const hostname = 'localhost';
const port = 8080;

const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require("path");
//const {json} = require("express");
const app = express();

const dir = path.join(__dirname, '/products/');

// serves the css as static so css will be applied
app.use(express.static(__dirname));
// parses the json that is being passed from the client
app.use(bodyParser.json());
// parses incoming url requests
app.use(express.urlencoded({
    extended: true
}))

// array to store the data
let dataArray;

mongoose.set('strictQuery', false);

var productSchema = new mongoose.Schema({
    id: Number,
    title: String,
    description: String,
    price: Number,
    discountPercentage: Number,
    rating: Number,
    stock: Number,
    brand: String,
    category: String,
    thumbnail: String,
    images: [String]
});

var Products = new mongoose.model('Products', productSchema, 'Products');

mongoose.connect('mongodb://127.0.0.1:27017/DB').then(() => {
    console.log('Connected to database');
});

// this renders the index.html file
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// this retrieves a request from the client when the load button is pressed in the html
app.get('/get-all-products', function (req, res) {
    // debugging client response
    //console.log(`function called\n`);
    if (dataArray == null) {
        let data = {}; // object to hold merged data
        fs.readdir(dir, function (err, files) {
            if (err) {
                console.log('ERROR: getting directory information: ' + err);
                res.status(500).send('ERROR: getting directory information');
            } else {
                files.forEach(function (file) {
                    // check if file is JSON
                    if (path.extname(file) === '.json') {
                        let filepath = path.join(dir, file);
                        // read file contents and parse as JSON
                        let fileData = JSON.parse(fs.readFileSync(filepath));
                        fileData.products.forEach(function (item) {
                            // extract the product key
                            let product = item['id'];
                            // if the product id doesn't exist in data object, create it
                            if (!(product in data)) {
                                data[product] = {};
                            }
                            // merge the item data into the product object
                            Object.assign(data[product], item);
                        });
                    }
                });
                // convert the data object into an array
                dataArray = Object.values(data);
                //console.log(dataArray);

                if (dataArray) {
                    if ((Products.exists({}))) {
                        mongoose.connection.db.dropCollection('Products');
                        Products.insertMany(dataArray);
                    }
                }
            }
        });
    }
    if (dataArray !== null) {
        Products.find({}).then(products => {
            res.status(200).json(products);
            //console.log(products);
        });
    }
});

app.post('/filter-product', function (req, res) {
    const filters = req.body;
    //console.log(filters);
    var query = Products.find({});

    if (filters){
        query.find({category: filters.category}).then(product => {
            res.status(200).json(product);
        });
    }
    //query.get('category')
});

// this retrieves a request from the client to select and filter out a selected product
app.get('/find-product', function (req, res) {
    const query = req.query.query;
    //console.log(query);
    Products.findOne({id: query}).then(product => {
        res.status(200).json(product);
        //console.log(product);
    });
});

// this receives a post request from the client to add a new entry into the database
app.post('/add-product', function (req, res) {
    try {
        const newProduct = req.body;
        if (newProduct !== null) {
            //console.log(newProduct);
            Products.create(newProduct);
            res.status(200).send("SUCCESS: Product added");
        }
    } catch (err) {
        res.status(404).send("ERROR: " + err + " | Unable to add product");
    }
});

// this put request from the client handles the modification of the existing data in mongodb
app.put('/update-product:id', async function (req, res) {
    try {
        let upProductId = req.params.id;
        //console.log(upProductId);
        let upProduct = req.body;
        if (upProduct !== null) {
            //console.log(upProduct);
            await Products.findOneAndReplace({id: upProductId}, upProduct);
            res.status(200).send("SUCCESS: Product updated");
        }
    } catch (err) {
        res.status(404).send("ERROR: " + err + " | Unable to update product");
    }
});

// delete request from client to delete an existing data entry
app.delete('/delete-product:id', async function (req, res) {
    try {
        const delProductId = req.params.id;
        //console.log(delProductId);
        await Products.findOneAndDelete({id:delProductId});
        res.status(200).send("SUCCESS: Product updated");
    } catch (err) {
        res.status(404).send("ERROR: " + err + " | Unable to update product");
    }
});

// server listens to the client
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/\n`);
});