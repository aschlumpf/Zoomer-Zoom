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
} from '@material-ui/core';
import { ExpandLess, ExpandMore, CreateOutlined } from '@material-ui/icons';
import { makeStyles, createStyles } from '@material-ui/core/styles';

// local
import { ZoomerStocks } from '../';
import {
  addToPortfolio,
  updateStockPrice,
  updateMetadata,
  updateStockAmount,
  deleteFromPortfolio,
} from '../../actions';
import './App.module.scss';

const drawerWidth = 240;

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
    stocks,
  } = props;

  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockInputOpen, setStockInputOpen] = useState(false);
  const [stockError, setStockError] = useState(false);
  const [amountError, setAmountError] = useState(false);

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

  const [stockSubscription, setStockSubscription] = useState(null);

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
        addToPortfolio({ ...newStock, amount });
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
    return () => stockSubscription.close();
  }, []);

  return (
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
              open={stockInputOpen}
              setOpen={setStockInputOpen}
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
          <Typography variant="h4" color="primary">
            My Portfolio
          </Typography>
          <Button
            className={classes.addButton}
            color="primary"
            variant="text"
            onClick={() => setDialogOpen(true)}
          >
            Add New Stock
          </Button>
          <Typography variant="body1">{`Total Value: ${totalValue ||
            '$0.00'}`}</Typography>
        </div>
        <Divider />
        <List>
          {stocks.map((stock, index) => (
            <div key={index}>
              <ListItem>
                <ListItemText
                  primary={`$${stock.ticker} $${stock.value.toFixed(2)}`}
                />
                <IconButton
                  className="collapse-button"
                  onClick={() => collapse(index)}
                >
                  {!collapseState[index] ? <ExpandMore /> : <ExpandLess />}
                </IconButton>
              </ListItem>
              <Collapse
                className="MuiListItem-gutters"
                in={collapseState[index]}
              >
                <Typography
                  className={classes.stockName}
                  gutterBottom
                  variant="subtitle1"
                >
                  {stock.company}
                </Typography>
                <dl>
                  <dt>
                    <div className="inline">
                      <span>Share Count </span>
                      <IconButton
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
          ))}
        </List>
      </Drawer>
      <section
        className={clsx(classes.content, {
          [classes.contentShift]: drawerOpen,
        })}
      >
        <h1>Zoomers zoom</h1>
        <div className="stock-search-container">
          <ZoomerStocks
            className="stock-search"
            open={stockInputOpen}
            setOpen={setStockInputOpen}
            formCtrl={setNewStock}
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
        <div className="graph">Graph goes here</div>
      </section>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { portfolio } = state;
  return {
    ...portfolio,
  };
};

export default connect(mapStateToProps, {
  addToPortfolio,
  updateStockPrice,
  updateMetadata,
  updateStockAmount,
})(App);
