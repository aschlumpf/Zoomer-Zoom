// external
import React, { useState } from 'react';
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
} from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';

// local
import { ZoomerDrawer } from '../';
import { testAction } from '../../actions';

const drawerWidth = 240;

const useStyles = makeStyles(theme =>
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

const App = ({ testAction }) => {
  const classes = useStyles();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={classes.root}>
      <CssBaseline />
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
          <h2>My Portfolio</h2>
        </div>
        <Divider />
        <List>
          {['GOOG', 'FB', 'TSLA'].map((text, index) => (
            <ListItem button key={index}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
          <ListItem button>
            <ListItemText primary="Add New.." />
          </ListItem>
        </List>
      </Drawer>
      <section
        className={clsx(classes.content, {
          [classes.contentShift]: drawerOpen,
        })}
      >
        <h1>Zoomers zoom!</h1>
        <button onClick={() => setDrawerOpen(!drawerOpen)}>
          Toggle Drawer
        </button>
      </section>
    </div>
  );
};

export default connect(null, { testAction })(App);
