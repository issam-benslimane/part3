require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
var morgan = require("morgan");
var cors = require("cors");
const Person = require("./mongodb");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

morgan.token("body", function (req, res) {
  return JSON.stringify(req.body);
});

app.get("/api/persons", (req, res) => {
  Person.find().then((data) => res.json(data));
});

app.post("/api/persons", [
  morgan(":method :url :status :res[content-length] - :response-time ms :body"),
  (req, res, next) => {
    const person = req.body;

    const newPerson = new Person(person);
    newPerson.save().then(res.json.bind(res)).catch(next);
  },
]);

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person == null) {
        res.status(404).end();
        return;
      }
      res.json(person);
    })
    .catch(next);
});

app.put("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  const person = req.body;
  Person.findByIdAndUpdate(id, person, { new: true })
    .then((person) => res.json(person))
    .catch(next);
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then(() => res.end())
    .catch((err) => next(err));
});

app.use((req, res, next) => {
  res.status(404).send({ error: "unknown endpoint" });
});

app.use((error, req, res, next) => {
  console.log(error);
  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  }

  if (error.name === "ValidationError") {
    return res.status(400).send({ error: error.message });
  }

  next(error);
});

app.listen(PORT);
