// HideRoutes.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function HideRoutes() {
    const location = useLocation();

    useEffect(() => {
        if (location.pathname !== '/resetSuccess') {
            window.history.replaceState(null, '', '/');
        }
    }, [location]);

    return null;
}
