import { CableRounded } from "@mui/icons-material";
import { Box, Divider, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";

export type PedalTypeEntry = {
  type: string;
  label: string;
  color: string;
};

export const pedalTypes: PedalTypeEntry[] = [
  { type: "oscillator", label: "Oscillator", color: "#2196F3" },
  { type: "volume", label: "Volume", color: "#4CAF50" },
  { type: "distortion", label: "Distortion", color: "#C62828" },
  { type: "output", label: "Output", color: "#444444" },
];

interface PedalPaletteProps {
  onSelect: (pedalType: string) => void;
  onAddCable: () => void;
}

export default function PedalPalette({ onSelect, onAddCable }: PedalPaletteProps) {
  return (
    <Box
      sx={{
        width: 160,
        minWidth: 160,
        borderRight: 1,
        borderColor: "divider",
        overflowY: "auto",
        height: 1,
      }}
    >
      <Typography variant="subtitle2" sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        Pedals
      </Typography>
      <List dense disablePadding>
        {pedalTypes.map((pedal) => (
          <ListItemButton
            key={pedal.type}
            onClick={() => onSelect(pedal.type)}
            sx={{ px: 2, py: 0.75 }}
          >
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                bgcolor: pedal.color,
                mr: 1.5,
                flexShrink: 0,
                border: "1px solid rgba(0,0,0,0.2)",
              }}
            />
            <ListItemText
              primary={pedal.label}
              primaryTypographyProps={{ variant: "body2" }}
            />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <List dense disablePadding>
        <ListItemButton onClick={onAddCable} sx={{ px: 2, py: 0.75 }}>
          <ListItemIcon sx={{ minWidth: 30 }}>
            <CableRounded fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Patch Cable"
            primaryTypographyProps={{ variant: "body2" }}
          />
        </ListItemButton>
      </List>
    </Box>
  );
}
