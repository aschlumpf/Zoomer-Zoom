export const addToPortfolio = (stock) => ({
  type: 'P_ADD_STOCK',
  stock,
});

export const updateStockPrice = (id, price) => ({
  type: 'P_NEW_PRICE',
  id,
  price,
});
