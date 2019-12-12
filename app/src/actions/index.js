export const addToPortfolio = (stock) => ({
  type: 'P_ADD_STOCK',
  stock,
});

export const deleteFromPortfolio = (id, isSelected) => ({
  type: 'P_DEL_STOCK',
  id,
  isSelected,
});

export const updateStockAmount = (id, amount) => ({
  type: 'P_NEW_AMOUNT',
  id,
  amount,
});

export const updateStockPrice = (id, price) => ({
  type: 'P_NEW_PRICE',
  id,
  price,
});

export const updateMetadata = (id, metadata) => ({
  type: 'P_NEW_METADATA',
  id,
  metadata,
});

export const setSelectedStock = (stock) => ({
  type: 'S_SELECTED_STOCK',
  stock,
});
