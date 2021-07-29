import {
    isOver,
    toDate,
    line,
    circle,
    bounderies
} from './utils';

const PADDING = 40;
const WIDTH = 600;
const HEIGHT = 200;
const DPI_WIDTH = WIDTH * 2;
const DPI_HEIGHT = HEIGHT * 2;
const VIEW_HEIGHT = DPI_HEIGHT - PADDING * 2;
const VIEW_WIDTH = DPI_WIDTH;
const ROWS_COUNT = 5;

export function chart(canvas, data) {
    const ctx = canvas.getContext('2d');
    let raf;
    canvas.style.width = WIDTH + 'px';
    canvas.style.height = HEIGHT + 'px';
    canvas.width = DPI_WIDTH;
    canvas.height = DPI_HEIGHT;

    const proxy = new Proxy({}, {
        set(...args) {
            const result = Reflect.set(...args);
            raf = requestAnimationFrame(paint)
            return result;
        }
    })

    canvas.addEventListener('mousemove', mousemove);
    canvas.addEventListener('mouseleave', mouseleave);

    function mousemove({
        clientX,
        clientY
    }) {
        const {
            left
        } = canvas.getBoundingClientRect();
        proxy.mouse = {
            x: (clientX - left) * 2,
        }
    }

    function mouseleave() {
        proxy.mouse = null;
    }

    function paint() {
        clear()
        const [yMin, yMax] = bounderies(data);
        const yRatio = VIEW_HEIGHT / (yMax - yMin);
        const xRatio = VIEW_WIDTH / (data.columns[0].length - 2);
        const yData = data.columns.filter(col => data.types[col[0]] === 'line');
        const xData = data.columns.filter(col => data.types[col[0]] !== 'line')[0];

        yAxis(yMin, yMax);
        xAxis(xData, xRatio);

        yData.map(toCoords(xRatio, yRatio)).forEach((coords, idx) => {
            const color = data.colors[yData[idx][0]];
            line(ctx, coords, {
                color
            })

            for (const [x, y] of coords) {
                if (isOver(proxy.mouse, x, coords.length, DPI_WIDTH)) {
                    circle(ctx, [x, y], color);
                    break;
                }
            }
        });
    }

    function xAxis(xData, xRatio) {
        const colsCount = 6;
        const step = Math.round(xData.length / colsCount);

        ctx.beginPath();
        for (let index = 1; index < xData.length; index++) {
            const x = index * xRatio;

            if ((index - 1) % step === 0) {
                const text = toDate(xData[index]);
                ctx.fillText(text.toString(), x, DPI_HEIGHT - 10);
            }

            if (isOver(proxy.mouse, x, xData.length, DPI_WIDTH)) {
                ctx.save();

                ctx.moveTo(x, PADDING / 2);
                ctx.lineTo(x, DPI_HEIGHT - PADDING)

                ctx.restore();
            }
        }
        ctx.stroke();
        ctx.closePath();
    }

    function yAxis(yMin, yMax) {
        const step = VIEW_HEIGHT / ROWS_COUNT;
        const textStep = (yMax - yMin) / ROWS_COUNT;
        ctx.beginPath();
        ctx.lineWidth = 1;
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
    }

    function clear() {
        ctx.clearRect(0, 0, DPI_WIDTH, DPI_HEIGHT)
    }

    return {
        init() {
            paint();
        },
        destroy() {
            cancelAnimationFrame(raf);
            canvas.removeEventListener('mousemove', mousemove);
            canvas.addEventListener('mouseleave', mouseleave);
        }
    }
}

function toCoords(xRatio, yRatio) {
    return (col) => col.map((y, i) => [
        Math.floor((i - 1) * xRatio),
        Math.floor(DPI_HEIGHT - PADDING - y * yRatio)
    ]).filter((_, i) => i !== 0);
}