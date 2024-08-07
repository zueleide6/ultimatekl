// ultimate-kl/pages/_app.js
import { AuthProvider } from '../lib/AuthContext';
import Header from '../components/Header';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import '../lib/globals.css';
import { useRouter } from 'next/router';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0080c0',
    },
    secondary: {
      main: '#1f1f1f',
    },
  },
});

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const showHeader = router.pathname !== '/login';

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {showHeader && <Header />}
        <main>
          <Component {...pageProps} />
        </main>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default MyApp;
