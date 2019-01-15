import React from "react";
import PropTypes from "prop-types";

const capitalise = source => `${source.substring(0,1).toUpperCase()}${source.substring(1)}`;

const Calculator = (props) => {

    return (

        <form onSubmit={props.onSubmit} >
            <label>Operation:
                <select name="op" onChange={props.onChange} value={props.op}>
                    {
                        props.ops.map((x, i) => <option key={i} value={x}>{capitalise(x)}</option>)
                    }
                </select>
            </label>
            <label>
                Value 1:
                <input type="number" step="any" name="val1" onChange={props.onChange} value={props.val1} />
            </label>
            <label>
                Value 2:
                <input type="number" step="any" name="val2" onChange={props.onChange} value={props.val2} />
            </label>
            <label>
                Result:
                <input type="text" readOnly name="result" value={props.result} />
            </label>
            <input type="submit" value="Calculate"/>
        </form>
    );
};

Calculator.propTypes = {
    val1: PropTypes.number,
    val2: PropTypes.number,
    result: PropTypes.string,
    ops: PropTypes.array,
    op: PropTypes.string,
};

export default Calculator;