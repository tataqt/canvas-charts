import {
    bounderies,
    circle,
    computeXRatio,
    computeYRatio,
    css,
    isOver,
    line,
    toCoords
} from "./utils";

const HEIGHT = 40;
const DPI_HEIGHT = HEIGHT * 2;

function noop() {}

export function sliderChart(root, data, WIDTH) {
    const DPI_WIDTH = WIDTH * 2;
    const canvas = root.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const minWidth = WIDTH * 0.05;
    let nextFn = noop;

    const $left = root.querySelector('[data-el="left"]');
    const $right = root.querySelector('[data-el="right"]');
    const $window = root.querySelector('[data-el="window"]');

    canvas.width = DPI_WIDTH;
    canvas.height = DPI_HEIGHT;
    css(canvas, {
        width: WIDTH + 'px',
        height: HEIGHT + 'px'
    });

    function next() {
        nextFn(getPosition());
    }

    function setPosition(left, right) {
        const w = WIDTH - right - left;

        if (w < minWidth) {
            css($window, {
                width: minWidth + 'px'
            });
            return;
        }

        if (left < 0) {
            css($window, {
                left: '0px'
            })
            css($left, {
                width: '0px'
            })
            return;
        }

        if (right < 0) {
            css($window, {
                right: '0px'
            })
            css($right, {
                width: '0px'
            })
            return;
        }

        css($window, {
            width: w + 'px',
            left: left + 'px',
            right: right + 'px',
        });

        css($right, {
            width: right + 'px'
        })

        css($left, {
            width: left + 'px'
        })

    }

    function getPosition() {
        const left = parseInt($left.style.width);
        const right = WIDTH - parseInt($right.style.width);

        return [(left * 100) / WIDTH,
            (right * 100) / WIDTH
        ]
    }

    function mousedown(event) {
        const type = event.target.dataset.type;
        const startX = event.pageX;
        const demensions = {
            left: parseInt($window.style.left),
            right: parseInt($window.style.right),
            width: parseInt($window.style.width),
        }
        let left, right;

        if (type === 'window') {
            document.onmousemove = e => {
                const delta = startX - e.pageX;
                if (delta === 0) {
                    return
                }

                left = demensions.left - delta;
                right = WIDTH - left - demensions.width;

                setPosition(left, right);
                next();
            }
        } else if (type === 'left' || type === 'right') {
            document.onmousemove = e => {
                const delta = startX - e.pageX;
                if (delta === 0) {
                    return;
                }

                if (type === 'left') {
                    left = WIDTH - (demensions.width + delta) - demensions.right;
                    right = WIDTH - (demensions.width + delta) - left;
                } else {
                    left = demensions.left;
                    right = WIDTH - (demensions.width - delta) - demensions.left;
                }

                setPosition(left, right);
                next();
            }
        }
    }

    function mouseup() {
        document.onmousemove = null;
    }

    root.addEventListener('mousedown', mousedown);
    document.addEventListener('mouseup', mouseup);

    const defaultWidth = WIDTH * 0.3;
    setPosition(0, WIDTH - defaultWidth);

    const [yMin, yMax] = bounderies(data);
    const yRatio = computeYRatio(DPI_HEIGHT, yMax, yMin);
    const xRatio = computeXRatio(DPI_WIDTH, data.columns[0].length);
    const yData = data.columns.filter(col => data.types[col[0]] === 'line');

    yData.map(toCoords(xRatio, yRatio, DPI_HEIGHT, -5, yMin)).forEach((coords, idx) => {
        const color = data.colors[yData[idx][0]];
        line(ctx, coords, {
            color
        });
    });

    return {
        subscribe(fn) {
            nextFn = fn;
            fn(getPosition());
        }
    }
}