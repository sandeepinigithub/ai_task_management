//mypreset.ts
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const MyPreset = definePreset(Aura, {
    //Your customizations, see the following sections for examples

    semantic: {
        primary: {
            50: '#F3F6FB',
            100: '#E6EDF7',
            200: '#C7D7EC',
            300: '#A5BDDF',
            400: '#6E8FC2',
            500: '#274472', // Brand Primary
            600: '#223C66',
            700: '#1C3256',
            800: '#162947',
            900: '#101E36',
            950: '#08101C'
        }
    }


});

export default MyPreset;