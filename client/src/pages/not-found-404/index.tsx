// client/src/pages/not-found/index.tsx
import { Box, Button, Typography, Container, keyframes } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { paths } from '@/shared/config/paths';
import moonImage from '@/assets/moon.png'; // Nhớ là đường dẫn tương đối nhé
import { useTranslation } from 'react-i18next';

// --- KEYFRAMES ĐÃ VIẾT LẠI ---
// 1. Twinkle giờ CHỈ điều khiển độ mờ (opacity)
const twinkle = keyframes`
  0%, 100% { opacity: var(--start-opacity); }
  50% { opacity: var(--end-opacity); }
`;

// 2. Animation di chuyển sang phải
const moveRight = keyframes`
  from { transform: translateX(-20vw); }
  to { transform: translateX(120vw); }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// --- HÀM TẠO SAO ĐÃ NÂNG CẤP LÊN LOGIC 3 LỚP PARALLAX ---
const createStars = (numStars: number) => Array.from({ length: numStars }, (_, i) => {
    const randomType = Math.random();
    let starProps;

    // Lớp Gần (5% sao): To, sáng, nhanh nhất
    if (randomType > 0.95) {
        starProps = {
            size: `${(Math.random() * 2.5 + 3) + 2}px`, // 3px - 5.5px
            startOpacity: Math.random() * 0.4 + 0.6, // 0.6 - 1.0
            endOpacity: 1,
            moveDuration: `${Math.random() * 15 + 30}s`, // 20s - 35s
        };
    }
    // Lớp Giữa (15% sao): Vừa, sáng vừa, tốc độ vừa
    else if (randomType > 0.80) {
        starProps = {
            size: `${(Math.random() * 1.5 + 1.5) + 2}px`, // 1.5px - 3px
            startOpacity: Math.random() * 0.3 + 0.3, // 0.3 - 0.6
            endOpacity: 0.8,
            moveDuration: `${Math.random() * 20 + 50}s`, // 35s - 55s
        };
    }
    // Lớp Nền (80% sao): Nhỏ, mờ, chậm nhất
    else {
        starProps = {
            size: `${(Math.random() * 1 + 0.5) + 2}px`, // 0.5px - 1.5px
            startOpacity: Math.random() * 0.2 + 0.1, // 0.1 - 0.3
            endOpacity: 0.5,
            moveDuration: `${Math.random() * 30 + 80}s`, // 55s - 85s
        };
    }

    return {
        id: `star-${i}`,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        twinkleDuration: `${Math.random() * 4 + 3}s`, // 3s - 7s
        ...starProps,
    };
});




export const NotFoundPage = () => {
    const stars = createStars(1000); // Tăng số lượng sao cho dày đặc
    const { t } = useTranslation(); // <-- 2. GỌI HOOK

    return (
        <Box sx={{
            position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '100vh', background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
            overflow: 'hidden', fontFamily: "'Dosis', sans-serif",
        }}>
            {/* Sao lấp lánh và di chuyển */}
            {stars.map((star) => (
                <Box key={star.id} sx={{
                    position: 'absolute', top: star.top, left: star.left,
                    width: star.size, height: star.size, bgcolor: 'white',
                    borderRadius: '50%',
                    animation: `${twinkle} ${star.twinkleDuration} infinite alternate, ${moveRight} ${star.moveDuration} linear infinite`,
                    '--start-opacity': star.startOpacity, '--end-opacity': star.endOpacity,
                } as React.CSSProperties} />
            ))}




            {/* Content */}
            <Container component="main" maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <Typography fontFamily={'"Dosis Variable", sans-serif'} component="h1" sx={{ fontSize: { xs: '8rem', md: '12rem' }, fontWeight: 800, color: 'white', position: 'relative', textShadow: '0 0 20px rgba(255, 255, 255, 0.4)', }}>404</Typography>

                {/* 3. DÙNG HÀM t() ĐỂ LẤY TEXT */}
                <Typography fontFamily={'"Dosis Variable", sans-serif'} variant="h2" component="h1" color="rgba(255, 255, 255, 0.8)" sx={{ mt: -2, fontWeight: 800 }}>
                    {t('notFound.title')}
                </Typography>

                <Box
                    component="img"
                    src={moonImage}
                    alt={t('notFound.moonAlt')} // <-- Lấy cả alt text
                    sx={{
                        width: '100%', maxWidth: '300px', height: 'auto',
                        display: 'block', mx: 'auto',
                        animation: `${spin} 15s linear infinite`,
                    }}
                />

                <Typography fontFamily={'"Dosis Variable", sans-serif'} variant="h5" component="h2" color="rgba(255, 255, 255, 0.8)" sx={{ mt: -2, fontWeight: 800 }}>
                    {t("notFound.description")}
                </Typography>

                <Button component={RouterLink} to={paths.home} variant="outlined" size="large" sx={{ mt: 4, fontWeight: 700, color: 'white', borderColor: 'rgba(255, 255, 255, 0.5)', '&:hover': { backgroundColor: 'rgba(115, 195, 241, 0.2)', borderColor: 'white', }, }}>
                    {t('notFound.button')}
                </Button>
            </Container>
        </Box>
    );
};