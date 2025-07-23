import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // Wenn ein Hash vorhanden ist, versuche zum entsprechenden Element zu scrollen
            const element = document.querySelector(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }

        // Nur nach oben scrollen, wenn kein Hash vorhanden ist
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname, hash]);

    return null;
}
