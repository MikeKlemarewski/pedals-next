import PedalBoardCard from "components/pedalBoardCard"
import Grid from '@mui/material/Grid';
import NewPedalBoardCard from "components/newPedalBoardCard";
import Divider from "@mui/material/Divider";
import { Box } from "@mui/material";


const stubBoards = [
  { name: 'Distortion Demon', description: 'This mix of high gain octane pedals is sure to send your soul to the depths of hell 🔥'},
  { name: 'Joe Satriani', description: 'Emulates the pedalboard of this virtuoso.'},
  { name: 'Ethereal Reverb', description: 'Sounds like you are playing in a 1000 year old basilica. Perfect for epic solos.'}
]

export default function Home() {
  return (
    <Box component="main">
      <Box sx={{ p: 2 }}>
        <NewPedalBoardCard />
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          {stubBoards.map((board, i) => (
            <Grid key={i} size={{ xs: 4 }}>
              <PedalBoardCard
                name={board.name}
                description={board.description}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
