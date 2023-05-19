// const {onRequest} = require("firebase-functions/v2/https");
// const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");

const admin = require("firebase-admin");
const serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");
const app = express("app");
const db = admin.firestore();

const cors = require("cors");
app.use(cors({origin: true}));

const collection = "products";

// Routes
app.get("/api/get", (req, res) => {
  return res.status(200).send("Hello-Word!");
});

// Create
// Post
app.post("/api/create", (req, res) => {
  (async () => {
    try {
      console.log("id:" + req.body.id);
      console.log("name:" + req.body.name);
      console.log("description:" + req.body.description);
      console.log("price:" + req.body.price);
      await db
          .collection(collection)
          .doc("/" + req.body.id + "/")
          .create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
          });
      return res
          .status(200)
          .send({success: true, message: "Created Success!"});
    } catch (err) {
      console.log("Status code:=500  " + err);
      return res.status(500).send({success: false, message: err});
    }
  })();
});

// Read on ID
// Get
app.get("/api/read/:id", (req, res) => {
  (async () => {
    try {
      const document = db.collection(collection).doc(req.params.id);
      const product = await document.get();
      const response = product.data();

      return res.status(200).send(response);
    } catch (err) {
      console.log("Status code:=500" + err);
      return res.status(500).send({success: false, message: err});
    }
  })();
});

// Read All
// Get
app.get("/api/read", (req, res) => {
  (async () => {
    try {
      const query = db.collection(collection);
      const response = [];

      await query.get().then((querySnapshot) => {
        const docs = querySnapshot.docs; // the result of the query
        for (const doc of docs) {
          const selectedItem = {
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description,
            price: doc.data().price,
          };
          response.push(selectedItem);
        }
        return response;
      });

      return res.status(200).send(response);
    } catch (err) {
      console.log("Status code:=500" + err);
      return res.status(500).send({success: false, message: err});
    }
  })();
});

// Update
// Put
app.put("/api/update/:id", (req, res) => {
  (async () => {
    try {
      console.log("id:" + req.body.id);
      console.log("name:" + req.body.name);
      console.log("description:" + req.body.description);
      console.log("price:" + req.body.price);
      const document = db.collection(collection).doc(req.params.id);
      await document.update({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
      });
      return res.status(200).send({
        success: true,
        message: "id:" + req.params.id + " Updated Success!",
      });
    } catch (err) {
      console.log("Status code:=500  " + err);
      return res.status(500).send({success: false, message: err});
    }
  })();
});

// Delete
// Delete
app.delete("/api/delete/:id", (req, res) => {
  (async () => {
    try {
      const document = db.collection(collection).doc(req.params.id);
      await document.delete();
      return res.status(200).send({
        success: true,
        message: "id:" + req.params.id + " Deleted Success!",
      });
    } catch (err) {
      console.log("Status code:=500  " + err);
      return res.status(500).send({success: false, message: err});
    }
  })();
});

// Export the api to Firebase Cloud Functions
exports.app = functions.https.onRequest(app);
