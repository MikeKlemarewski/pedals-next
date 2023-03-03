import { Box } from "@mui/material";
import PedalBoardCanvas from "components/pedalBoardCanvas";

export default function PedalBoard() {
  return (
    <main>
      <div>Pedal board</div>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <PedalBoardCanvas />
      </Box>
    </main>
  )
}
