import { combineReducers } from 'redux';
import ls from 'local-storage';

const STOCKS = 'stocks';

const initialState = {
  stocks: ls.get(STOCKS) || [],
};

const addStock = (state, action) => {
  const { stock } = action;
  const { id, ticker, company, amount } = stock;
  const newStocks = [
    ...state.stocks,
    { id, ticker, company, amount: Number(amount), price: 0, value: 0 },
  ];
  ls.set(STOCKS, newStocks);
  const newState = { ...state, stocks: newStocks };
  return newState;
};

const newPrice = (state, action) => {
  const { id, price } = action;
  const newStocks = [];

  state.stocks.forEach((stock) => {
    if (stock.id === id) {
      stock.price = Math.round(price * 100) / 100;
      stock.value = (stock.price * stock.amount).toFixed(2);
      newStocks.push(stock);
    } else {
      newStocks.push(stock);
    }
  });
  return { ...state, stocks: newStocks };
};

const portfolio = (state = initialState, action) => {
  switch (action.type) {
    case 'P_ADD_STOCK':
      return addStock(state, action);
    case 'P_NEW_PRICE':
      return newPrice(state, action);
    default:
      console.log(action.type);
      return state;
  }
};

export default combineReducers({
  portfolio,
});
