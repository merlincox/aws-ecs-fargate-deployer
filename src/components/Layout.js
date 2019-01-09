import React from "react";
import {
    Route,
    NavLink
} from "react-router-dom";
import Home from "./Home";
import About from "./About";

export default class Layout extends React.Component {

    render() {
        return (
            <div>
                <h1>Super Simple React SSR SPA for AWS ECS Fargate</h1>
                <ul className="header">
                    <li><NavLink exact to="/">Home</NavLink></li>
                    <li><NavLink to="/about">About</NavLink></li>
                </ul>
                <div className="content">
                    <Route exact path="/" component={Home}/>
                    <Route path="/about" render={ props => <About environment={this.props.environment} />}/>
                </div>
            </div>
        );
    }
}