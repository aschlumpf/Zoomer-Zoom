// external
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import io from 'socket.io-client';

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
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
// local
import { ZoomerStocks } from '../';
import { addToPortfolio, updateStockPrice } from '../../actions';
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
      justifyContent: 'flex-end',
    },
    drawerPaper: {
      width: drawerWidth,
    },
    dialog: {
      maxWidth: 480,
    },
  })
);

const App = ({ addToPortfolio, updateStockPrice, stocks }) => {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockInputOpen, setStockInputOpen] = useState(false);
  const [stockError, setStockError] = useState(false);
  const [amountError, setAmountError] = useState(false);

  const [amount, setAmount] = useState(-1);
  const [newStock, setNewStock] = useState({});
  const [collapseState, setCollapseState] = useState(
    new Array(stocks.length).fill(false)
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

  const closeDialog = (option) => {
    if (option === 'SAVE' && newStock) {
      if (validate()) {
        addToPortfolio({ ...newStock, amount });
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

  useEffect(() => {
    setCollapseState([...collapseState, false]);
  }, [stocks]);

  useEffect(() => {
    const subscription = io('http://localhost:3000/LiveStockData');
    subscription.on('data', (result) => {
      const { _id: id, price } = result;
      updateStockPrice(id, price);
    });
    stocks.forEach((stock) => {
      subscription.emit('join', { id: stock.id });
    });
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
          <h1>My Portfolio</h1>
        </div>
        <Divider />
        <List>
          {stocks.map((stock, index) => (
            <div key={index}>
              <ListItem>
                <ListItemText
                  primary={`$${stock.ticker} (${stock.amount}): ${stock.price *
                    stock.amount}`}
                />
                <span onClick={() => collapse(index)}>
                  {!collapseState[index] ? <ExpandMore /> : <ExpandLess />}
                </span>
              </ListItem>
              <Collapse
                className="MuiListItem-gutters"
                in={collapseState[index]}
              >
                <p>{stock.company}</p>
              </Collapse>
            </div>
          ))}
          <ListItem button onClick={() => setDialogOpen(true)}>
            <ListItemText primary="Add New.." />
          </ListItem>
        </List>
      </Drawer>
      <section
        className={clsx(classes.content, {
          [classes.contentShift]: drawerOpen,
        })}
      >
        <h1>Zoomers zoom</h1>
        <button onClick={() => setDrawerOpen(!drawerOpen)}>
          Toggle Drawer
        </button>
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
})(App);
