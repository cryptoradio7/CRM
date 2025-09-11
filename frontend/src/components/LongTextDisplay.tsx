import React, { useState } from 'react';
import { Typography, IconButton, Tooltip, Box } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';

interface LongTextDisplayProps {
  text: string;
  maxLength?: number;
  variant?: 'body1' | 'body2' | 'caption';
  color?: 'textPrimary' | 'textSecondary' | 'primary' | 'secondary';
  sx?: any;
  showToggle?: boolean;
}

const LongTextDisplay: React.FC<LongTextDisplayProps> = ({
  text,
  maxLength = 100,
  variant = 'body2',
  color = 'textSecondary',
  sx = {},
  showToggle = true
}) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!text) return null;
  
  const isLong = text.length > maxLength;
  const displayText = expanded || !isLong ? text : `${text.substring(0, maxLength)}...`;
  
  if (!isLong || !showToggle) {
    return (
      <Typography 
        variant={variant} 
        color={color}
        sx={{ 
          wordBreak: 'break-word',
          lineHeight: 1.4,
          ...sx
        }}
        title={text}
      >
        {displayText}
      </Typography>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
      <Typography 
        variant={variant} 
        color={color}
        sx={{ 
          wordBreak: 'break-word',
          lineHeight: 1.4,
          flex: 1,
          ...sx
        }}
        title={text}
      >
        {displayText}
      </Typography>
      <Tooltip title={expanded ? 'Réduire' : 'Voir plus'}>
        <IconButton
          size="small"
          onClick={() => setExpanded(!expanded)}
          sx={{ p: 0.5, ml: 0.5 }}
        >
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default LongTextDisplay;


