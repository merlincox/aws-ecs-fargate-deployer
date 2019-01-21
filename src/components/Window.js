import React from "react";

const Window = (props) => (
    <div>
        <h2>Window Inner Width: { props.innerWidth }</h2>
        <p>Demonstrating a simple Higher Order Component (HOC). Note that we cannot assume the existence of the global window object when components are rendered server-side using renderToString.</p>
    </div>
);

export default Window;
