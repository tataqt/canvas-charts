import { getChartData } from '/data.js';
const PADDING = 40;
const WIDTH = 600;
const HEIGHT = 200;
const DPI_WIDTH = WIDTH * 2;
const DPI_HEIGHT = HEIGHT * 2;
const VIEW_HEIGHT = DPI_HEIGHT - PADDING * 2;
const VIEW_WIDTH = DPI_WIDTH;
const ROWS_COUNT = 5;

function chart(canvas, data) {
    const ctx = canvas.getContext('2d');
    canvas.style.width = WIDTH + 'px';
    canvas.style.height = HEIGHT + 'px';
    canvas.width = DPI_WIDTH;
    canvas.height = DPI_HEIGHT;

    const [yMin, yMax] = computeBounderies(data);

    const yRatio = VIEW_HEIGHT / (yMax - yMin);
    const xRatio = VIEW_WIDTH / (data.columns[0].length - 2);

    // === y axis
    const step = VIEW_HEIGHT / ROWS_COUNT;
    const textStep = (yMax - yMin) / ROWS_COUNT;
    ctx.beginPath();

    ctx.strokeStyle = '#bbb';
    ctx.font = 'normal 20px Helvetica, sans-serif';
    ctx.fillStyle = '#96a2aa';

    for (let i = 1; i <= ROWS_COUNT; i++) {
        const y = step * i;
        const text = Math.round(yMax - textStep * i);
        ctx.fillText(text.toString(), 5, y + PADDING - 10);
        ctx.moveTo(0, y + PADDING);
        ctx.lineTo(DPI_WIDTH, y + PADDING);
    }

    ctx.stroke();
    ctx.closePath();
    //

    data.columns.forEach(col => {
        const name = col[0];
        if (data.types[name] === 'line') {
            const coords = col.map((y, i) => [
                Math.floor((i - 1) * xRatio),
                Math.floor(DPI_HEIGHT - PADDING - y * yRatio)
            ]).filter((_, i) => i !== 0);

            const color = data.colors[name];
            line(ctx, coords, { color });

        }
    });
}

function line(ctx, coords, { color }) {
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    for (const [x, y] of coords) {
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.closePath();
}

chart(document.getElementById('chart'), getChartData())

function computeBounderies({ columns, types }) {
    let min;
    let max;

    columns.forEach(col => {
        if (types[col[0]] !== 'line') {
            return;
        }

        if (typeof min !== 'number') min = col[1]
        if (typeof max !== 'number') max = col[1]

        if (min > col[1]) min = col[1]
        if (max < col[1]) max = col[1]

        for (let index = 2; index < col.length; index++) {
            if (min > col[index]) min = col[index]
            if (max < col[index]) max = col[index]
        }
    })

    return [min, max];
}