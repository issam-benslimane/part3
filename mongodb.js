const mongoose = require("mongoose");

const mongoDB = process.env.MONGODB_URI;
mongoose.connect(mongoDB);

const PersonSchema = new mongoose.Schema({
  name: { type: String, minLength: 3, required: true },
  number: {
    type: String,
    required: true,
    validate: {
      validator(v) {
        return /^\d{2}-\d{8,}$/.test(v);
      },
      message(props) {
        return `${props.value} is not a valid number`;
      },
    },
  },
});

PersonSchema.set("toJSON", {
  transform(document, obj) {
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
  },
});

module.exports = mongoose.model("Person", PersonSchema);
