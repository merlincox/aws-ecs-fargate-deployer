import express from "express";
import path from "path";
import React from "react";
import {renderToString} from "react-dom/server";
import Layout from "./components/Layout";
import {StaticRouter} from "react-router-dom";
import {htmlEncode} from 'js-htmlencode';

const dateobj = new Date();
const datestamp = dateobj.toISOString();

const app = express();

const envPrefix = 'ECS_';

let environment = { datestamp: datestamp };

Object.keys(process.env).forEach((key) => {

        if (key.startsWith(envPrefix)) {
            environment[key.substring(envPrefix.length).toLowerCase()] = process.env[key];
        }
    }
);

const encodedEnv = htmlEncode(JSON.stringify(environment));

const port = environment.port || 3000;
const message = environment.release ? `Release ${environment.release} on ${environment.platform} platform from ${environment.branch} branch at commit ${environment.commit} at ${datestamp} on port ${port}` : `Running locally at ${datestamp} on port ${port}`;

//"dist" is the default webpack 4 output directory
app.use(express.static(path.resolve(__dirname, "../dist")));

app.get("/healthcheck", (req, res) => {
    res.sendStatus(200);
});

app.get("/*", (req, res) => {

    const context = {};
    const url = req.url;
    const jsx = (
        <StaticRouter context={context} location={url}>
            <Layout environment={environment}/>
        </StaticRouter>
    );

    const reactDom = renderToString(jsx);

    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(htmlTemplate(reactDom));
});

app.listen(port);

console.log(message);

//"main.js" is the default webpack 4 javascript output
function htmlTemplate(reactDom) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <link rel="stylesheet" type="text/css" href="index.css">
            <title>SSR SPA for ECS</title>
        </head>
        
        <body>
            <div id="app" data-env="${encodedEnv}">${reactDom}</div>
            <script src="./main.js"></script>
        </body>
        </html>
    `;
}