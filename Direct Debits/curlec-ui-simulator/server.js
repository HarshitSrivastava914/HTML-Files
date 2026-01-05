const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

app.use("/", require("./routes/index"));
app.use("/", require("./routes/newMandate"));
app.use("/", require("./routes/mandateAuthoriser"));

app.listen(3000, () => {
  console.log("Simulator running at http://localhost:3000");
});
