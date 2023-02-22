import React from 'react';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';

const NewPedalBoardCard = () => {

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea LinkComponent={Link} href="/pedal-board">
        <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
          <AddIcon sx={{ mr: 1 }} />
          <Typography variant="h5" component="div">
            New pedal board
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default NewPedalBoardCard;
