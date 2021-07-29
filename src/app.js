import {chart} from './chart';
import {getChartData} from './data.js';
import './styles.scss';

const tgChart = chart(document.getElementById('chart'), getChartData());
tgChart.init();