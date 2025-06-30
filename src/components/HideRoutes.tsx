// HideRoutes.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function HideRoutes() {
    const location = useLocation();
    const allowedPaths = [
        '/resetSuccess',
        '/details/lebensmittel',
        '/details/wasser',
        '/details/medikamente',
        '/details/hygiene',
        '/details/informieren',
        '/details/beduerfnisse',
        '/details/dokumente',
        '/details/gepaeck',
        '/details/sicherheit',
    ]

    useEffect(() => {
        if (location.pathname !== '/resetSuccess' && !allowedPaths.includes(location.pathname)) {
            window.history.replaceState(null, '', '/');
        }
    }, [location]);

    return null;
}
