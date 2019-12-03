import { combineReducers } from 'redux';
import ls from 'local-storage';

const STOCKS = 'stocks';

const initialState = {
  stocks: [],
};

const portfolio = (state = initialState, action) => {
  switch (action.type) {
    case 'P_ADD_STOCK':
      const { stock } = action;
      const newStocks = [...state.stocks, stock];
      ls.set(STOCKS, newStocks);
      const newState = { ...state, stocks: newStocks };
      return newState;
    default:
      return state;
  }
};

export default combineReducers({
  portfolio,
});
