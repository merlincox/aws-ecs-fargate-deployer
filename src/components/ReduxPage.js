import React from "react";
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import ReduxApp from './ReduxApp';
import rootReducer from '../reducers';

const store = createStore(rootReducer)

const ReduxPage = () => (
    <Provider store={store}>
        <ReduxApp />
    </Provider>
);

export default ReduxPage;
