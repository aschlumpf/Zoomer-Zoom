import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './components';
import './styles/main.scss';

ReactDOM.render(<App />, document.getElementById('app'));

if (module.hot) {
  module.hot.accept();
}
