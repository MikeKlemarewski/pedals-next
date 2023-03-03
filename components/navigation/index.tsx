import { AppBar, Box, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useCallback, useState } from 'react';

import Drawer from './drawer';
import Link from 'next/link';

interface Props {
  children: React.ReactNode;
}

const Navigation = ({ children } : Props) => {

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleToggleDrawer = useCallback(() => setDrawerOpen(!drawerOpen), [drawerOpen]);

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar sx={theme => ({ zIndex: theme.zIndex.drawer + 1 })}>
        <Toolbar variant="dense">
          <IconButton
            sx={{ mr: 2 }}
            color="inherit"
            onClick={handleToggleDrawer}
          >
            <MenuIcon/>
          </IconButton>
          <Typography>Pedal Board</Typography>
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" open={drawerOpen}>
        <Toolbar variant="dense" />
        <List>
          <ListItem disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              href="/pedal-editor"
              sx={{
                justifyContent: drawerOpen ? 'initial' : 'center',
                minHeight: 48,
                px: 2.5
              }}
            >
              <ListItemIcon
                sx={{
                  justifyContent: 'center'
                }}
              >
                <AddBoxIcon />
              </ListItemIcon>
              <ListItemText
                primary="New Pedal"
                sx={{
                  opacity: drawerOpen ? 1 : 0
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      {/* Empty toolbar used to offset the page content so it is not hidden by the main toolbar */}
      <Box sx={{ width: 1 }}>
        <Toolbar variant="dense" />
        {children}
      </Box>
    </Box>
  )
}

export default Navigation;
