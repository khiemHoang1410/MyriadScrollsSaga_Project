// client/src/features/play/components/ChoiceButton.tsx

import { Button } from '@/shared/ui/Button'; // Dùng lại Button xịn của mình
import type { Choice } from '../types';

interface ChoiceButtonProps {
  choice: Choice;
  onClick: (choiceId: string) => void;
  disabled?: boolean;
}

export const ChoiceButton = ({ choice, onClick, disabled }: ChoiceButtonProps) => {
  return (
    <Button
      variant="outlined"
      fullWidth
      onClick={() => onClick(choice.choiceId)}
      disabled={disabled}
      sx={{ mb: 1.5, justifyContent: 'flex-start', textAlign: 'left', p: 2 }}
    >
      {choice.text}
    </Button>
  );
};