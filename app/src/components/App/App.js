// external
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';

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
  DialogContentText,
  DialogTitle,
  TextField,
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';

// local
import { addToPortfolio } from '../../actions';

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
  })
);

const App = ({ addToPortfolio, stocks }) => {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStock, setNewStock] = useState('');

  const closeDialog = (option) => {
    if (option === 'SAVE' && newStock) {
      addToPortfolio(newStock);
      setNewStock('');
    }
    setDialogOpen(false);
  };

  useEffect(() => {}, []);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Dialog open={dialogOpen} maxWidth="sm">
        <DialogTitle>Add a new stock</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Stock"
            type="text"
            onChange={(event) => setNewStock(event.target.value)}
            fullWidth
          />
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
          {stocks.map((text, index) => (
            <ListItem button key={index}>
              <ListItemText primary={text} />
            </ListItem>
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
})(App);
