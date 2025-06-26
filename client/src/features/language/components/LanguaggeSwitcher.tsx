import { useTranslation } from 'react-i18next';
import { Button, Stack } from '@mui/material';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <Stack direction="row" spacing={1} sx={{ position: 'fixed', top: 16, right: 16 }}>
      <Button
        variant={i18n.resolvedLanguage === 'en' ? 'contained' : 'outlined'}
        onClick={() => i18n.changeLanguage('en')}
      >
        English
      </Button>
      <Button
        variant={i18n.resolvedLanguage === 'vi' ? 'contained' : 'outlined'}
        onClick={() => i18n.changeLanguage('vi')}
      >
        Tiếng Việt
      </Button>
    </Stack>
  );
}

export default LanguageSwitcher;