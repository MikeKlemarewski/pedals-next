import { ArrowBack } from '@mui/icons-material';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface Props {
  children: React.ReactNode;
}

const Navigation = ({ children } : Props) => {
  const router = useRouter();
  const isHome = router.pathname === '/';

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar sx={theme => ({ zIndex: theme.zIndex.drawer + 1 })}>
        <Toolbar variant="dense">
          {!isHome && (
            <IconButton
              component={Link}
              href="/"
              color="inherit"
              sx={{ mr: 1 }}
            >
              <ArrowBack />
            </IconButton>
          )}
          <Typography>Pedal Board</Typography>
        </Toolbar>
      </AppBar>

      {/* Empty toolbar used to offset the page content so it is not hidden by the main toolbar */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        width: 1,
      }}>
        <Toolbar variant="dense" />
        {children}
      </Box>
    </Box>
  )
}

export default Navigation;
