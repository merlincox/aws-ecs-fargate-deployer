import React from "react";
import PropTypes from 'prop-types';
import {
    Route,
    NavLink,
    Switch
} from "react-router-dom";

import Home from "./Home";
import About from "./About";
import Api from "./Api";
import Page404 from "./Page404";

const Layout = (props) => (
    <div>
        <h1>Super Simple React SSR SPA for AWS ECS Fargate</h1>
        <ul className="header">
            <li><NavLink exact to="/">Home</NavLink></li>
            <li><NavLink exact to="/api">API</NavLink></li>
            <li><NavLink exact to="/about">About</NavLink></li>
        </ul>
        <div className="content">
            <Switch>
                <Route exact path="/" component={Home}/>
                <Route exact path="/api" render={() => <Api environment={props.environment}/>}/>
                <Route exact path="/about" render={() => <About environment={props.environment}/>}/>
                <Route render={() => <Page404/>}/>
            </Switch>
        </div>
    </div>
);

Layout.propTypes = {
    environment: PropTypes.object,
};

export default Layout;