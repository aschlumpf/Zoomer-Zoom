import React, { useState } from 'react';
import { connect } from 'react-redux';
import { testAction } from '../../actions';

const App = ({ testAction }) => {
  const [counter, setCounter] = useState(0);
  return (
    <>
      <h1>Zoomers zoom!</h1>
      <button
        className="btn btn-primary"
        onClick={() => {
          testAction(`hello ${counter}`);
          setCounter(counter + 1);
        }}>
        Test redux
      </button>
    </>
  );
};

export default connect(null, { testAction })(App);
