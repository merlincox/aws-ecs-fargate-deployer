import React, {Component} from "react";
import Calculator from "./Calculator";

class Api extends Component {

    constructor(props) {

        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);

        this.state = {
            result: '0',
            val1: 0,
            val2: 0,
            op: 'add',
        };
    }

    handleChange(e) {

        let value = isNaN(e.target.value) ? e.target.value : Number(e.target.value);

        this.setState({[e.target.name]: value});
    }

    handleSubmit(e) {

        e.preventDefault();

        const url = `https://api-test.merlincox.uk/calc/${this.state.op}?val1=${this.state.val1}&val2=${this.state.val2}`;

        console.log(`Calling ${url}`);

        fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        }).then(response => {
            if (response.ok) {
                response.json().then(data => this.setState({result: data.result}))
            } else {
                response.json().then(data => this.setState({result: data.message}))
            }
        }).catch(err => console.log(err));
    };

    render() {

        const ops = ['add', 'subtract', 'multiply', 'divide', 'power', 'root'];

        return (
            <div>
                <h2>API</h2>
                <p>Also demonstrating simple integration with AWS API Gateway.</p>
                <p>See <a href="https://github.com/merlincox/aws-api-gateway-deploy"
                          target="_blank">https://github.com/merlincox/aws-api-gateway-deploy</a></p>
                <Calculator onSubmit={this.handleSubmit}
                            onChange={this.handleChange}
                            result={this.state.result}
                            ops={ops}
                            op={this.state.op}
                            val1={this.state.val1}
                            va12={this.state.val2}
                />
            </div>
        );
    }
}

export default Api;