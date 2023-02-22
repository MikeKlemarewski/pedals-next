import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import React from 'react';

interface Props {
  name: string;
  description: string;
}

const PedalBoardCard = ({
  name,
  description,
} : Props) => {

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default PedalBoardCard;
