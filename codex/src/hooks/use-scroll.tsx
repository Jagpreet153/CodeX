import { useState, useEffect } from 'react'

export const useScroll = (threshold=10) => {
    const [isScrolled, setisScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setisScrolled(window.scrollY > threshold );
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); 
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [threshold]);

    return isScrolled;
};