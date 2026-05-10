const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());


mongoose.connect(your_mongodb_connection_string)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

app.listen(5000, () => {
    console.log("Server running on port 5000");
});