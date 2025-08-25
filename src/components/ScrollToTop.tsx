import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // 1) Hash-Anker: Priorität hat Scroll zum Element
        if (hash) {
            const element = document.querySelector(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }

        // 2) Notfall-Details (/details/*): Scroll-Position beibehalten
        if (pathname.startsWith('/details/')) {
            return;
        }

        // 3) Standard: Immer nach oben springen
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
        const docEl = document.documentElement as HTMLElement | null;
        const bodyEl = document.body as HTMLElement | null;
        if (docEl) docEl.scrollTop = 0;
        if (bodyEl) bodyEl.scrollTop = 0;
    }, [pathname, hash]);

    return null;
}
