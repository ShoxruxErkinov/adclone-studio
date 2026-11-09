import type {Metadata} from 'next';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/500.css';
import '@fontsource/manrope/600.css';
import '@fontsource/manrope/700.css';
import '@fontsource/manrope/800.css';
import './globals.css';
export const metadata:Metadata={title:'AdClone Studio — Mahsulotingiz. Yangi hikoya.',description:'Mahsulot havolasidan tahrirlanadigan reklama videosigacha. Ssenariy, jonli prevyu va MP4 eksport.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="uz"><body>{children}</body></html>;}
