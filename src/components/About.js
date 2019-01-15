import React from "react";
import PropTypes from 'prop-types';

const capitalise = source => `${source.substring(0,1).toUpperCase()}${source.substring(1)}`;

const About = (props) => {

    const environment = props.environment || {};

    const lines = Object.keys(environment).sort().map((key, index) => (
        <p key={index}>{`${capitalise(key)}: ${environment[key]}`}</p>)
    );

    if (lines.length === 0) {
        lines.push(<p key="0">{`No environment was found to display`}</p>)
    }

    return (
        <div>
            <h2>About</h2>
            {lines}
        </div>
    );
};

About.propTypes = {
    environment: PropTypes.object,
};

export default About;
