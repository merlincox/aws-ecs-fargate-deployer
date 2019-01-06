const express = require('express');
const app = express();
const dateobj = new Date();
const datestamp = dateobj.toISOString();;
const port = process.env.ECS_PORT || 3000;
const message = process.env.RELEASE ? `${process.env.PLATFORM} platform. Release: ${process.env.RELEASE} built from ${process.env.BRANCH} branch at commit ${process.env.COMMIT} running at ${datestamp} on port ${port}` :  `Local platform. Running locally at ${datestamp} on port ${port}`;

app.get('/', (req, res) => {
    res.send(message)
});

app.get('/healthcheck', (req, res) => {
    res.sendStatus(200)
});

app.listen(port, () => {
    console.log(message)
});
