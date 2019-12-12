import { combineReducers } from 'redux';
import ls from 'local-storage';

const STOCKS = 'stocks';

const initialState = {
  stocks: ls.get(STOCKS) || [],
};

const toDollarFormat = (number, asFloat, multiple) => {
  const target = multiple ? number * multiple : number;
  const result = (Math.round(target * 100) / 100).toFixed(2);
  if (asFloat) {
    return parseFloat(result);
  }
  return `$${result}`;
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
  let newTotalValue = 0;
  state.stocks.forEach((stock) => {
    if (stock.id === id) {
      stock.price = toDollarFormat(price, true);
      stock.value = toDollarFormat(stock.price, true, stock.amount);
    }
    newTotalValue += stock.value;
    newStocks.push(stock);
  });
  ls.set(STOCKS, newStocks);

  return {
    ...state,
    totalValue: toDollarFormat(newTotalValue, false),
    stocks: newStocks,
  };
};

const updateMetadata = (state, action) => {
  const { id, metadata } = action;
  const newStocks = [];
  state.stocks.forEach((stock) => {
    if (stock.id === id) {
      const { sector, open, yield: yieldPrice, marketCap } = metadata;
      const newStock = {
        ...stock,
        sector,
        open: toDollarFormat(open, false),
        yield: toDollarFormat(yieldPrice, false),
        marketCap: toDollarFormat(marketCap, false),
      };
      newStocks.push(newStock);
    } else {
      newStocks.push(stock);
    }
  });
  ls.set(STOCKS, newStocks);

  return { ...state, stocks: newStocks };
};

const deleteStock = (state, action) => {
  const { id } = action;
  const newStocks = [];
  let newTotalValue = 0;
  state.stocks.forEach((stock) => {
    if (stock.id !== id) {
      newStocks.push(stock);
      newTotalValue += stock.value;
    }
  });
  ls.set(STOCKS, newStocks);

  return {
    ...state,
    totalValue: toDollarFormat(newTotalValue, false),
    stocks: newStocks,
  };
};

const updateAmount = (state, action) => {
  const { id, amount } = action;
  const newStocks = [];
  let newTotalValue = 0;
  state.stocks.forEach((stock) => {
    if (stock.id === id) {
      stock.amount = Number(amount);
      stock.value = toDollarFormat(stock.price, true, stock.amount);
    }
    newTotalValue += stock.value;
    newStocks.push(stock);
  });
  ls.set(STOCKS, newStocks);

  return {
    ...state,
    totalValue: toDollarFormat(newTotalValue, false),
    stocks: newStocks,
  };
};

const search = (state = {}, action) => {
  switch (action.type) {
    case 'S_SELECTED_STOCK':
      const { stock } = action;
      return { ...state, selectedStock: stock };
    default:
      return state;
  }
};

const portfolio = (state = initialState, action) => {
  switch (action.type) {
    case 'P_ADD_STOCK':
      return addStock(state, action);
    case 'P_NEW_PRICE':
      return newPrice(state, action);
    case 'P_NEW_METADATA':
      return updateMetadata(state, action);
    case 'P_NEW_AMOUNT':
      return updateAmount(state, action);
    case 'P_DEL_STOCK':
      return deleteStock(state, action);
    default:
      return state;
  }
};

export default combineReducers({
  portfolio,
  search,
});
