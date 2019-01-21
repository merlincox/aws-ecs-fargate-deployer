import React from "react";

const withWindowWidth = Component => (

    class extends React.Component {

        constructor(props) {

            super(props);

            const window = window || {};

            this.state = {
                innerWidth: window.innerWidth,
            };

            this.handleResize = this.handleResize.bind(this);
        }

        handleResize() {

            if (window) {

                this.setState({
                    innerWidth: window.innerWidth,
                });
            }

        }

        componentDidMount() {

            if (window) {

                if (!this.state.innerWidth) {
                    this.handleResize();
                }

                window.addEventListener('resize', this.handleResize);
            }
         }

        componentWillUnmount() {

            if (window) {
                window.removeEventListener('resize', this.handleResize);
            }
        }

        render() {
            return <Component {...this.props} {...this.state} />;
        }
    }
);


export default withWindowWidth;
