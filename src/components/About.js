import React, {Component} from "react";

class About extends Component {

    render() {

        const environment = this.props.environment || {};

        const ps = Object.keys(environment).sort().map((key, index) => (
            <p key={index}>{`${key.substring(0, 1).toUpperCase()}${key.substring(1)}: ${environment[key]}`}</p>)
        );

        if (ps.length === 0) {
            ps.push(<p key="0">{`No environment was found to display`}</p>)
        }

        return (
            <div>
                <h2>About</h2>
                {ps}
            </div>
        );
    }
}

export default About;
