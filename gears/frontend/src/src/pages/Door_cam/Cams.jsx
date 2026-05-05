import { useState, useEffect } from 'react'
import { AppNavigation } from '../../models/navigation';
import { Fetches } from '../../models/fetchData';

import '../../App.css'


function Cams({ accessToken, deviceSerial, verifyCode })
{
    useEffect(() => {
            // Initialisation du lecteur EZVIZ
            if (!window.EZUIKit) {
                console.warn("EZUIKit n'est pas encore chargé, nouvelle tentative dans 500ms...");
                const timer = setTimeout(() => {
                    // Ici tu peux forcer un re-render ou appeler une fonction d'init
                }, 500);
                return () => clearTimeout(timer);
            }
            if (window.EZUIKit)
            {
                const decoder = new window.EZUIKit.EZUIPlayer({
                    id: 'play-window',
                    autoplay: true,
                    url: `ezopen://open.ezvizlife.com/${deviceSerial}/1.live`,
                    accessToken: accessToken,
                    decoderPath: '', // Laisser vide si chargé via script
                    width: 600,
                    height: 400,
                    handleError: (e) => console.log("Erreur flux:", e),
                });
    
                return () => decoder.stop(); // On coupe le flux quand on quitte la page
            }
        }, [accessToken, deviceSerial]);

        return <div id="play-window"></div>;
}

export default Cams
