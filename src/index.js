import React from "react";
import ReactDOM from "react-dom";
import Layout from "./components/Layout";
import {BrowserRouter} from "react-router-dom"
import { htmlDecode } from 'js-htmlencode';

const app = document.getElementById( "app" );
const env = JSON.parse(htmlDecode(app.dataset.env));

ReactDOM.hydrate( <BrowserRouter><Layout environment={env} /></BrowserRouter>, app );
