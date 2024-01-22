const { getResult } = require('./utils');
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

app.post('/api/v1/results', (req, res) => {
  const data = getResult(req.body.inputData)
  res.send(data);
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});