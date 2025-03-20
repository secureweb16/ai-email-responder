require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const APP_URL = process.env.APP_URL;
const emailRoutes = require("./routes/email"); 
const swagger = require("./swagger");

app.use(express.json());
app.use(cors());
app.use("/api/email/", emailRoutes);

swagger(app);
app.listen(port, ()=>{
    console.log(`Server is running at ${APP_URL}:${port}`);
});
