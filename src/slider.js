import {
    bounderies,
    circle,
    css,
    isOver,
    line,
    toCoords
} from "./utils";

const HEIGHT = 40;
const DPI_HEIGHT = HEIGHT * 2;

export function sliderChart(root, data, WIDTH) {
    const DPI_WIDTH = WIDTH * 2;
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    css(canvas, {
        width: WIDTH + 'px',
        height: HEIGHT + 'px'
    });

    canvas.width = DPI_WIDTH;
    canvas.height = DPI_HEIGHT;

    const [yMin, yMax] = bounderies(data);
    const yRatio = DPI_HEIGHT / (yMax - yMin);
    const xRatio = DPI_WIDTH / (data.columns[0].length - 2);
    const yData = data.columns.filter(col => data.types[col[0]] === 'line');

    yData.map(toCoords(xRatio, yRatio, DPI_HEIGHT, -5)).forEach((coords, idx) => {
        const color = data.colors[yData[idx][0]];
        line(ctx, coords, {
            color
        });
    });
}