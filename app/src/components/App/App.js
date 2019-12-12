// external
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import clsx from 'clsx';
import io from 'socket.io-client';

const METADATA_API = 'http://localhost:3000/meta/id=';

// material
import {
  CssBaseline,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Collapse,
  Typography,
  ButtonGroup,
  IconButton,
  Switch,
  FormControlLabel,
} from '@material-ui/core';
import { ExpandLess, ExpandMore, CreateOutlined } from '@material-ui/icons';
import {
  createMuiTheme,
  makeStyles,
  createStyles,
} from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import red from '@material-ui/core/colors/red';

// local
import { ZoomerStocks } from '../';
import { ZoomerGraph } from '../';
import {
  addToPortfolio,
  updateStockPrice,
  updateMetadata,
  updateStockAmount,
  deleteFromPortfolio,
  setSelectedStock,
} from '../../actions';
import './App.module.scss';

const drawerWidth = 240;

const theme = createMuiTheme({
  palette: {
    secondary: { main: red.A700 },
  },
});

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: -drawerWidth,
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      ...theme.mixins.toolbar,
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
    },
    drawerPaper: {
      width: drawerWidth,
    },
    dialog: {
      maxWidth: 480,
    },
    stockName: {
      fontWeight: 'bold',
      fontSize: '14pt',
    },
    addButton: {
      textTransform: 'none',
      display: 'inline-block',
    },
  })
);

const App = (props) => {
  const {
    addToPortfolio,
    updateStockPrice,
    updateMetadata,
    updateStockAmount,
    deleteFromPortfolio,
    totalValue,
    setSelectedStock,
    selectedStock,
    stocks,
  } = props;

  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockError, setStockError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [searchDisabled, setSearchDisabled] = useState(false);

  const [numStocks, setNumStocks] = useState(0);
  const [amount, setAmount] = useState(-1);
  const [newStock, setNewStock] = useState({});
  const [collapseState, setCollapseState] = useState(
    new Array(stocks.length).fill(false)
  );
  const [editState, setEditState] = useState(
    new Array(stocks.length).fill({
      amount: 0,
      editMode: false,
    })
  );

  const [trackedPrice, setTrackedPrice] = useState([]);

  const [stockSubscription, setStockSubscription] = useState(null);

  const changeSelectedStock = (newStock) => {
    if (selectedStock) {
      stockSubscription.emit('leave', { id: selectedStock.id });
      deleteFromPortfolio(selectedStock.id, true);
      setSelectedStock({});
    }
    if (stockSubscription && newStock) {
      stockSubscription.emit('join', { id: newStock.id });
    }
    if (newStock) {
      addToPortfolio({ ...newStock, isSelected: true });
      setSelectedStock(newStock);
    }
  };

  const togglePortfolioGraph = () => {
    if (!searchDisabled) {
      setSelectedStock(null);
      setSearchDisabled(true);
    } else {
      setSearchDisabled(false);
    }
  };

  const validate = () => {
    let valid = true;
    if (!newStock.ticker || !newStock.company) {
      setStockError(true);
      valid = false;
    }
    if (amount < 0) {
      setAmountError(true);
      valid = false;
    }
    return valid;
  };

  const fetchMetadata = (id) => {
    return (async () => {
      const { data: metadata } = await axios({
        method: 'GET',
        url: `${METADATA_API}${id}`,
      });
      updateMetadata(id, metadata);
    })();
  };

  const closeDialog = (option) => {
    if (option === 'SAVE' && newStock) {
      if (validate()) {
        addToPortfolio({ ...newStock, amount, isSelected: false });
        fetchMetadata(newStock.id);
        stockSubscription.emit('join', { id: newStock.id });
        setNewStock({});
        setAmount(-1);
      } else {
        return;
      }
    }
    setDialogOpen(false);
  };

  const collapse = (index) => {
    const newState = [...collapseState];
    newState[index] = !newState[index];
    setCollapseState(newState);
  };

  const toggleEditMode = (index) => {
    const newState = [...editState];
    const newEditState = {
      ...editState[index],
      editMode: !editState[index].editMode,
    };
    newState[index] = newEditState;
    setEditState(newState);
  };

  const newAmount = (amount, id) => {
    if (amount) {
      updateStockAmount(id, amount);
    }
  };

  useEffect(() => {
    if (stocks.length > numStocks) {
      setCollapseState([...collapseState, false]);
      setEditState([...editState, { amount: 0, editMode: false }]);
      setNumStocks(stocks.length);
    }
    // There can be changes other than length!!
    if (stocks.length < numStocks) {
      setCollapseState(new Array(stocks.length).fill(false));
      setEditState(
        new Array(stocks.length).fill({ amount: 0, editMode: false })
      );
      setNumStocks(stocks.length);
    }
    const [currSelectedStock] = stocks.filter((stock) => stock.isSelected);
    if (currSelectedStock) {
      setTrackedPrice([...trackedPrice, currSelectedStock.price]);
    } else {
      setTrackedPrice([]);
    }
  }, [stocks]);

  useEffect(() => {
    const subscription = io('http://localhost:3000/LiveStockData');
    subscription.on('data', (result) => {
      const { _id: id, price } = result;
      updateStockPrice(id, price);
    });
    for (let i = 0; i < stocks.length; i++) {
      const stock = stocks[i];
      subscription.emit('join', { id: stock.id });
      fetchMetadata(stock.id);
    }
    setStockSubscription(subscription);
    return () => {
      stocks.forEach((stock) =>
        stockSubscription.emit('leave', { id: stock.id })
      );
      stockSubscription.close();
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <CssBaseline />
        <Dialog open={dialogOpen} maxWidth="md" fullWidth>
          <DialogTitle>Add a new stock</DialogTitle>
          <DialogContent>
            <form>
              <ZoomerStocks
                required
                error={stockError}
                setError={setStockError}
                formCtrl={setNewStock}
              />
              <TextField
                className="form-control"
                required
                helperText={amountError && 'Enter a valid number of stocks'}
                error={amountError}
                onChange={(event) => {
                  setAmountError(false);
                  setAmount(event.target.value);
                }}
                label="Number of shares"
                type="number"
              />
            </form>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog('CLOSE')} color="primary">
              Cancel
            </Button>
            <Button onClick={() => closeDialog('SAVE')} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
        <Drawer
          className={classes.drawer}
          classes={{
            paper: classes.drawerPaper,
          }}
          variant="persistent"
          anchor="left"
          open={drawerOpen}
        >
          <div className={classes.drawerHeader}>
            <h1 className="my-portfolio">My Portfolio</h1>
            <Button
              className={classes.addButton}
              color="primary"
              variant="text"
              onClick={() => setDialogOpen(true)}
            >
              Add New Stock
            </Button>
            {/* <FormControlLabel
            labelPlacement="start"
            control={
              <Switch onClick={() => togglePortfolioGraph()} color="primary" />
            }
            label="See Graph"
          /> */}
            <Typography variant="body1">{`Total Value: ${totalValue ||
              '$0.00'}`}</Typography>
          </div>
          <Divider />
          <List className="stock-list">
            {stocks.map(
              (stock, index) =>
                !stock.isSelected && (
                  <div key={index}>
                    <ListItem>
                      <ListItemText
                        className="stock-text"
                        primary={`$${stock.ticker} $${stock.value.toFixed(2)}`}
                      />
                      <IconButton
                        className="collapse-button"
                        onClick={() => collapse(index)}
                      >
                        {!collapseState[index] ? (
                          <ExpandMore aria-label="Expand" />
                        ) : (
                          <ExpandLess aria-label="Undo Expand" />
                        )}
                      </IconButton>
                    </ListItem>
                    <Collapse
                      className="MuiListItem-gutters"
                      in={collapseState[index]}
                    >
                      <h2 className={classes.stockName}>{stock.company}</h2>
                      <Button
                        color="secondary"
                        onClick={() => {
                          stockSubscription.emit('leave', { id: stock.id });
                          deleteFromPortfolio(stock.id, false);
                        }}
                      >
                        Delete
                      </Button>
                      <dl>
                        <dt>
                          <div className="inline">
                            <span>Share Count </span>
                            <IconButton
                              aria-label="Edit Share Count"
                              color={
                                editState[index] && !editState[index].editMode
                                  ? 'default'
                                  : 'primary'
                              }
                              onClick={() => toggleEditMode(index)}
                              edge="start"
                            >
                              <CreateOutlined />
                            </IconButton>
                          </div>
                        </dt>
                        <dd>
                          {editState[index] && !editState[index].editMode ? (
                            stock.amount
                          ) : (
                            <TextField
                              onChange={(event) =>
                                newAmount(event.target.value, stock.id)
                              }
                              type="number"
                              defaultValue={stock.amount}
                              inputProps={{ min: '1' }}
                            />
                          )}
                        </dd>
                        <dt>Share Price</dt>
                        <dd>{`$${stock.price}`}</dd>
                        <dt>Sector</dt>
                        <dd>{stock.sector}</dd>
                        <dt>Open</dt>
                        <dd>{stock.open}</dd>
                        <dt>Yield</dt>
                        <dd>{stock.yield}</dd>
                        <dt>Market Cap</dt>
                        <dd>{stock.marketCap}</dd>
                      </dl>
                    </Collapse>
                  </div>
                )
            )}
          </List>
        </Drawer>
        <section
          className={clsx(classes.content, {
            [classes.contentShift]: drawerOpen,
          })}
        >
          <Typography className="main-heading" variant="h1" color="primary">
            Zoomers zoom
          </Typography>
          <div className="stock-search-container">
            <ZoomerStocks
              id="main-search"
              disabled={searchDisabled}
              className="stock-search"
              formCtrl={changeSelectedStock}
            />{' '}
            <Button
              size="large"
              variant="contained"
              color="primary"
              className={classes.addButton}
              onClick={() => setDrawerOpen(!drawerOpen)}
            >
              Toggle Portfolio
            </Button>
          </div>
          <section className="selected-stock">
            <Typography variant="h2" color="primary">
              Selected Stock Price (in $)
            </Typography>
            <ZoomerGraph prices={trackedPrice} />
          </section>
        </section>
      </div>
    </ThemeProvider>
  );
};

const mapStateToProps = (state) => {
  const { portfolio, search } = state;
  return {
    ...portfolio,
    ...search,
  };
};

export default connect(mapStateToProps, {
  addToPortfolio,
  deleteFromPortfolio,
  updateStockPrice,
  updateMetadata,
  updateStockAmount,
  setSelectedStock,
})(App);
