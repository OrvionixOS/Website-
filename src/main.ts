import '@fontsource-variable/manrope';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './styles/main.css';

import { initNav } from './ui/nav';
import { initAccordion } from './ui/accordion';
import { initCalculator } from './ui/calculator';

initNav(document);
initAccordion(document);
initCalculator(document);
