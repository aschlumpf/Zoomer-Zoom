import React, { useState } from 'react';
import { Drawer } from '@material-ui/core';

const ZoomerDrawer = () => {
  return (
    <Drawer anchor="left" variant="persistent" open={true}>
      <p>Test</p>
    </Drawer>
  );
};

export default ZoomerDrawer;
