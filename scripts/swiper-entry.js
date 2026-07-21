/**
 * Minimal Swiper build for YMG DESIGN roadmap.
 * Modules used: FreeMode only (core is always included).
 */
import Swiper from 'swiper';
import { FreeMode } from 'swiper/modules';

Swiper.use([FreeMode]);
window.Swiper = Swiper;
