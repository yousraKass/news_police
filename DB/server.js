require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const dataRouter = require('./routers/data.js');
const queryDataRouter = require('./routers/query_data.js');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.use("/data", dataRouter);
app.use("/query_data", queryDataRouter);

app.get("/", (req, res) => {
  res.json({
    message: "News Police DB API is running!",
    status: "healthy",
    timestamp: new Date().toISOString(),
    routes: ["/data", "/query_data"]
  });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});