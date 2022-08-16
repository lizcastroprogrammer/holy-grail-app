var express = require("express");
var app = express();

//TODO: create a redis client
var redis = require("redis");
var client = redis.createClient();
// serve static files from public directory
app.use(express.static("public"));

// TODO: initialize values for: header, left, right, article and footer using the redis client
client.connect();
client.on("connect", () => {
  client
    .multi()
    .set("header", 0)
    .set("left", 0)
    .set("article", 0)
    .set("right", 0)
    .set("footer", 0)
    .exec();

  client
    .multi()
    .get("header")
    .get("left")
    .get("article")
    .get("right")
    .get("footer")
    .exec()
    .then((item) => {
      console.log(item);
    });
});

// Get values for holy grail layout
function data() {
  // TODO: uses Promise to get the values for header, left, right, article and footer from Redis
  return new Promise((resolve, reject) => {
    client
      .multi()
      .get("header")
      .get("left")
      .get("article")
      .get("right")
      .get("footer")
      .exec()
      .then((value) => {
        console.log(value);

        const data = {
          header: Number(value[0]),
          left: Number(value[1]),
          article: Number(value[2]),
          right: Number(value[3]),
          footer: Number(value[4]),
        };
        value ? resolve(data) : reject(null);
      });
  });
}

// plus
app.get("/update/:key/:value", function (req, res) {
  const key = req.params.key;
  let value = Number(req.params.value);
  client.get(key).then(function (item) {
    //TODO: use the redis client to update the value associated with the given key
    value = Number(item) + value;
    client.set(key, value);

    console.log(value);

    data().then((data) => {
      console.log(data);
      res.send(data);
    });
  });
});

// get key data
app.get("/data", function (req, res) {
  data().then((data) => {
    console.log(data);
    res.send(data);
  });
});

app.listen(3000, () => {
  console.log("Running on 3000");
});

process.on("exit", function () {
  client.quit();
});
