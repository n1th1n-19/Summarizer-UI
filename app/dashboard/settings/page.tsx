'use client';
import { Box, Typography, Card, CardContent, Switch, FormControlLabel, Divider } from '@mui/material';

export default function SettingsPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      
      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Preferences
          </Typography>
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Enable notifications"
          />
          
          <Divider sx={{ my: 2 }} />
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Auto-generate summaries"
          />
          
          <Divider sx={{ my: 2 }} />
          
          <FormControlLabel
            control={<Switch />}
            label="Dark mode"
          />
        </CardContent>
      </Card>
    </Box>
  );
}