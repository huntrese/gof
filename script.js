/*
	Conway's game of life
	Wikipedia: https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
	Play here: https://playgameoflife.com/
	Rules:
		Any live cell with fewer than two live neighbours dies, as if by underpopulation.
	    Any live cell with two or three live neighbours lives on to the next generation.
	    Any live cell with more than three live neighbours dies, as if by overpopulation.
	    Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
 */

window.onload = main;
const canvas = document.querySelector('#gol-canvas');


// board - 500x500
const ROWS = 200;
const COLS = 300;
const START_X = 0;
const START_Y = 0;
const END_X = 2*canvas.width;
const END_Y = 2*canvas.height;
const WIDTH_X = (END_Y - START_Y) / ROWS;
const WIDTH_Y = (END_X - START_X) / COLS;

let GENERATION_COUNT = 0;

// elements
// const canvas = document.querySelector('#gol-canvas');
const stepBtn = document.querySelector('#step');
const startBtn = document.querySelector('#start');
const pauseBtn = document.querySelector('#pause');
const resetBtn = document.querySelector('#reset');
const intervalInput = document.querySelector('#interval');

const ctx = canvas.getContext('2d');
ctx.fillStyle = '#333';

let isMouseDown = false;
let isMouseMove = false;
let prevCell = { row: -1, col: -1 };
let toggleTimer;

canvas.addEventListener('mousedown', canvasMouseDownHandler);
canvas.addEventListener('mousemove', canvasMouseMoveHandler);
canvas.addEventListener('mouseup', canvasMouseUpHandler);
canvas.addEventListener('mousemove', canvasMoveHandler);
// stepBtn.addEventListener('click', stepGenerationHandler);
// startBtn.addEventListener('click', startClickHandler);
document.addEventListener('keydown', function(event) {
    switch(event.key){
		case "p":
		case "P":
			pauseClickHandler();
			break;
		case "r":
		case "R":
			resetClickHandler();
			break;
		case "s":
		case "S":
		case " ":
			startClickHandler();
			break;
		case "n":
		case "N":
			stepGenerationHandler();
			break;
	}
});
// resetBtn.addEventListener('click', resetClickHandler);
intervalInput.addEventListener('input', startClickHandler);


function canvasMouseMoveHandler() {
    if (isMouseDown) {
        isMouseMove = true;
    }
}
function canvasMoveHandler(e) {
    if (isMouseDown && isMouseMove) {
        clearTimeout(toggleTimer);
        toggleTimer = setTimeout(() => {
            const elemLeft = canvas.offsetLeft + canvas.clientLeft;
            const elemTop = canvas.offsetTop + canvas.clientTop;
            const x = e.pageX - elemLeft;
            const y = e.pageY - elemTop;
            const col = Math.ceil(x/10); 
            const row = Math.ceil(y/10);
            if (row !== prevCell.row || col !== prevCell.col) {
                toggleCell(row-1, col-1);
                prevCell = { row, col };
            }
        }, 10); // Adjust the delay time as needed (in milliseconds)
    }
}
function canvasMouseUpHandler() {
    isMouseDown = false;
    if (!isMouseMove) {
        prevCell = { row: -1, col: -1 };
    }
    isMouseMove = false;
}
function canvasMouseDownHandler(e) {
    isMouseDown = true;
    isMouseMove = false;
    clearTimeout(toggleTimer);
    const elemLeft = canvas.offsetLeft + canvas.clientLeft;
    const elemTop = canvas.offsetTop + canvas.clientTop;
    const x = e.pageX - elemLeft;
    const y = e.pageY - elemTop;
    const col = Math.ceil(x/10); 
    const row = Math.ceil(y/10);
	if (row !== prevCell.row || col !== prevCell.col) {
		toggleCell(row-1, col-1);
		prevCell = { row, col };
	}
}

function stepGenerationHandler() {
    GENERATION_COUNT += 1;
    updateGenerationCount();
    let newDataMatrix = [];
    resetMatrixToZero(newDataMatrix);
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            newDataMatrix[i][j] = decideIfCellAliveInNextGen(i, j, dataMatrix[i][j]);
        }
    }
    dataMatrix = newDataMatrix;
    drawGrid();
}

// canvas click handler
// just finds the exact cell that was clicked and calls the toggleCell function
function canvasClickHandler(e) {
	if (isMouseDown) {
		const elemLeft = canvas.offsetLeft + canvas.clientLeft;
		const elemTop = canvas.offsetTop + canvas.clientTop;
		const x = e.pageX - elemLeft;
		const y = e.pageY - elemTop;
		const col = Math.ceil(x/10), 
			row = Math.ceil(y/10);
		toggleCell(row-1, col-1);
	}
}


function startClickHandler() {
    pauseClickHandler();
    function animate() {
        stepGenerationHandler();
        TIMEOUT_ID = requestAnimationFrame(animate);
    }
    TIMEOUT_ID = requestAnimationFrame(animate);
}



function pauseClickHandler() {
    cancelAnimationFrame(TIMEOUT_ID);
}

function resetClickHandler() {
    pauseClickHandler();
    updateGenerationCount(true);
    resetMatrixToZero(dataMatrix);
    drawGrid();
}




let TIMEOUT_ID;

let dataMatrix = [];

resetMatrixToZero(dataMatrix);

function main() {
	drawGrid();
}

function updateGenerationCount(reset=false) {
	if(reset) {
		GENERATION_COUNT = 0;
	}
	document.querySelector('#generation-count').innerHTML = GENERATION_COUNT;
}




// decide if a cell should be alive in the next generation
function decideIfCellAliveInNextGen(row, col, isAlive) {
	if(isAlive) {		
		switch(numberOfNeighbours(row, col)) {
			case 0:
			case 1:
				return 0;
				break;
			case 2:
			case 3:
				return 1;
				break;
			case 4: 
			case 5: 
			case 6: 
			case 7: 
			case 8:
				return 0;
				break
			default:
				return 0; 
		}
	}
	// for the dead cell to regenerate
	else {
		if(numberOfNeighbours(row, col) == 3) {
			return 1;
		}
	}
	return 0;
}

// returns the number of living neighbours a cell has
// zero indexed
function numberOfNeighbours(row, col) {
	let count = 0;
	/*
	|_|_|_|_|_
	|_|a|b|c|_
	|_|d|1|e|_
	|_|f|g|h|_
	|_|_|_|_|_
	a = row-1, col-1
	b = row-1, col
	c = row-1, col+1
	d = row, col-1
	e = row, col+1
	f = row+1, col-1
	g = row+1, col
	h = row+1, col+1
	*/
	// a
	if(row > 0 && col > 0 && dataMatrix[row-1][col-1] == 1) {
		count += 1;
	}
	// b
	if(row > 0 && dataMatrix[row-1][col] == 1) {
		count += 1;
	}
	// c
	if(row > 0 && col < COLS-1 && dataMatrix[row-1][col+1] == 1) {
		count += 1;
	}
	// d
	if(col > 0 && dataMatrix[row][col-1] == 1) {
		count += 1;
	}
	// e
	if(col < COLS-1 && dataMatrix[row][col+1] == 1) {
		count += 1;
	}
	// f
	if(row < ROWS-1 && col > 0 && dataMatrix[row+1][col-1] == 1) {
		count += 1;
	}
	// g
	if(row < ROWS-1 && dataMatrix[row+1][col] == 1) {
		count += 1;
	}
	// h
	if(row < ROWS-1 && col < COLS-1 && dataMatrix[row+1][col+1] == 1) {
		count += 1;
	}
	return count;
}

// clears the canvas and renders a fresh grid with dead/living cells
function drawGrid() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	let areAllCellsDead = true;

	// render alive cells from dataMatrix
	for(i=0; i<dataMatrix.length; i++) {
		for(j=0; j<dataMatrix[i].length; j++) {
			if(dataMatrix[i][j] == 1) {
				areAllCellsDead = false;
				const row = i+1;
				const col = j+1;
				const x = row*10;
				const y = col*10;
				ctx.fillStyle = `rgb(0,${Math.abs(255-(GENERATION_COUNT*5))}, 0)`;
				ctx.fillRect(y-10, x-10, 10, 10);
			}
		}
	}

	// render grid lines
	for(i=1; i<ROWS; i++) {
		ctx.beginPath();
		ctx.moveTo(i*WIDTH_X, START_Y);
		ctx.lineTo(i*WIDTH_X, END_Y);
		ctx.moveTo(START_X, i*WIDTH_Y);
		ctx.lineTo(END_X, i*WIDTH_Y);
		ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // Adjust alpha value here

		ctx.stroke();
	}
	if(areAllCellsDead) {
		pauseClickHandler();
	}
}



// given a row and col index, 
// toggles that cell from dead to alive or vice versa
function toggleCell(row, col) {
	dataMatrix[row][col] = (dataMatrix[row][col] + 1) % 2;
	drawGrid();
}

function resetMatrixToZero(matrix) {
	for(i=0; i<ROWS; i++) {
		matrix[i] = new Array(COLS);
		for(j=0; j<COLS; j++) {
			matrix[i][j] = 0;
		}
	}
}

