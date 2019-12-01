import { combineReducers } from 'redux';

const testReducer = (state = [], action) => {
  switch (action.type) {
    case 'TEST_ACTION':
      return [
        {
          text: action.text,
        },
      ];
    default:
      return state;
  }
};

export default combineReducers({
  testReducer,
});
