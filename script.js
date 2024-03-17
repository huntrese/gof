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

		class Cell {
			constructor(row, col,kind=-1) {
				this.row = row;
				this.col = col;
				this.isAlive = false;
				this.species = kind
				
			}
		
			toggle(who) {
				this.isAlive = !this.isAlive;
				this.species = who
			}
		}
		
		class GameOfLife {
			constructor(rows, cols) {
				this.rows = rows;
				this.cols = cols;
				this.dataMatrix = this.createMatrix(rows, cols);
			}
		
			createMatrix(rows, cols) {
				const matrix = [];
				for (let i = 0; i < rows; i++) {
					matrix[i] = new Array(cols).fill(null).map((_, j) => new Cell(i, j, -1)); // Initialize with species -1
				}
				return matrix;
			}
		
			resetMatrixToZero(matrix) {
				for (let i = 0; i < this.rows; i++) {
					for (let j = 0; j < this.cols; j++) {
						matrix[i][j].isAlive = false;
						matrix[i][j].species = -1; // Assigning a different species value to dead cells
					}
				}
			}
			
		
			toggleCell(row, col, species) {
				if (this.dataMatrix[row][col].species === -1) {
					// Cell is dead, toggle it to alive and assign species
					this.dataMatrix[row][col].toggle(species);
				} else {
					// Cell is already alive, just update species
					this.dataMatrix[row][col].species = species;
				}
			}
			
			
		
			decideIfCellAliveInNextGen(row, col) {
				const cell = this.dataMatrix[row][col];
				const neighborsData = this.numberOfNeighbours(row, col, cell.species); // Remove species argument
				neighborsData.allies-=neighborsData.enemies;

				if (cell.isAlive) {
					if (neighborsData.allies === 3 || neighborsData.allies === 2) {
						return true;
					} else {
						return false;
					}
				} else {
					if (neighborsData.allies === 3) {
						// Assign the majority species among neighbors to the newly created cell
						cell.species = neighborsData.majoritySpecies;
						return true;
					} else {
						return false;
					}
				}
			}
			
			numberOfNeighbours(row, col, currentSpecies) {
				let allies = 0;
				let enemies = 0;
				let speciesCount = {}; // Object to store count of each species
				const dirs = [
					[-1, -1], [-1, 0], [-1, 1],
					[0, -1], [0, 1],
					[1, -1], [1, 0], [1, 1]
				];
			
				for (const [dx, dy] of dirs) {
					const newRow = row + dx;
					const newCol = col + dy;
					if ((newRow >= 0) && (newRow < this.rows) && (newCol >= 0) && (newCol < this.cols)) {
						const neighborCell = this.dataMatrix[newRow][newCol];
						if (neighborCell.isAlive) {
							allies++;
							// Check if the neighbor is an enemy and determine if it prevents revival
							if (neighborCell.species !== -1 && currentSpecies !== neighborCell.species) {
								const preventRevivalChance = Math.random(); // Random chance between 0 and 1
								if (preventRevivalChance < 0.5) {
									// Enemy prevents revival with 50% chance
									// enemies++;
								}
							}
							// Increment count for the species
							speciesCount[neighborCell.species] = (speciesCount[neighborCell.species] || 0) + 1;
						}
					}
				}
			
				// Find the majority species among neighbors
				let majoritySpecies = null;
				let maxCount = 0;
				for (const species in speciesCount) {
					if (speciesCount[species] > maxCount) {
						maxCount = speciesCount[species];
						majoritySpecies = species;
					}
				}
			
				return { allies, enemies, majoritySpecies };
			}
			
			
			
			
			
		
			stepGeneration() {
				const newDataMatrix = this.createMatrix(this.rows, this.cols);
				for (let i = 0; i < this.rows; i++) {
					for (let j = 0; j < this.cols; j++) {
						newDataMatrix[i][j].isAlive = this.decideIfCellAliveInNextGen(i, j);
						newDataMatrix[i][j].species = this.dataMatrix[i][j].species; // Copy species information
					}
				}
				this.dataMatrix = newDataMatrix;
			}
			
		}
		
		window.onload = main;
		const canvas = document.querySelector('#gol-canvas');
		
		// board - 500x500
		const ROWS = 200;
		const COLS = 300;
		const START_X = 0;
		const START_Y = 0;
		const END_X = 2 * canvas.width;
		const END_Y = 2 * canvas.height;
		const WIDTH_X = (END_Y - START_Y) / ROWS;
		const WIDTH_Y = (END_X - START_X) / COLS;
		
		let GENERATION_COUNT = 0;
		let intervalBetweenGenerations = 100; // Default interval between generations
		
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

		cell_col=0;
		document.addEventListener('keydown', function (event) {
			switch (event.key) {
				case "z":
				case "Z":
					cell_col=0;
					break;
				case "x":
				case "X":
					cell_col=1;

					break;
				case "c":
				case "C":
					cell_col=2;
					break;

				case "v":
				case "V":
					cell_col=3;
					break;
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
		document.addEventListener('wheel', mouseWheelHandler);
		
		const generationHistory = [];
		const game = new GameOfLife(ROWS, COLS);
		
		function canvasMouseMoveHandler() {
			if (isMouseDown) {
				isMouseMove = true;
			}
		}
		
		function canvasMoveHandler(e) {
			if (isMouseDown && isMouseMove) {
				clearTimeout(toggleTimer);
				toggleTimer = setTimeout(() => {
					const rect = canvas.getBoundingClientRect();
					const scaleX = canvas.width / rect.width;
					const scaleY = canvas.height / rect.height;
					const offsetX = rect.left - canvas.clientLeft;
					const offsetY = rect.top - canvas.clientTop;
					const x = (e.clientX - offsetX) * scaleX;
					const y = (e.clientY - offsetY) * scaleY;
					const col = Math.ceil(x / 10);
					const row = Math.ceil(y / 10);
					if (row !== prevCell.row || col !== prevCell.col) {
						game.toggleCell(row - 1, col - 1,cell_col);
						prevCell = { row, col };
						drawGrid();
					}
				}, 10);
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
			const rect = canvas.getBoundingClientRect();
			const scaleX = canvas.width / rect.width;
			const scaleY = canvas.height / rect.height;
			const offsetX = rect.left - canvas.clientLeft;
			const offsetY = rect.top - canvas.clientTop;
			const x = (e.clientX - offsetX) * scaleX;
			const y = (e.clientY - offsetY) * scaleY;
			const col = Math.floor(x / WIDTH_X);
			const row = Math.floor(y / WIDTH_Y);
			if (row !== prevCell.row || col !== prevCell.col) {
				if (!game.dataMatrix[row][col].isAlive) { // Only toggle species if the cell is dead
					game.toggleCell(row, col, cell_col);
				}
				prevCell = { row, col };
				drawGrid();
			}
		}
		
		function stepGenerationHandler() {
			GENERATION_COUNT += 1;
			updateGenerationCount();
			generationHistory.push(JSON.parse(JSON.stringify(game.dataMatrix)));
			if (generationHistory.length > 60) {
				generationHistory.shift();
			}
			game.stepGeneration();
			drawGrid();
		}
		
		function mouseWheelHandler(event) {
			const delta = Math.sign(event.deltaY);
			if (delta === -1 && generationHistory.length > 0) {
				game.dataMatrix = generationHistory.pop();
				GENERATION_COUNT -= 1;
				updateGenerationCount();
				drawGrid();
			}
		}
		
		function updateGenerationCount(reset = false) {
			if (reset) {
				GENERATION_COUNT = 0;
			}
			document.querySelector('#generation-count').innerHTML = GENERATION_COUNT;
		}
		
		function startClickHandler() {
			pauseClickHandler();
			function animate() {
				stepGenerationHandler();
				TIMEOUT_ID = setTimeout(animate, intervalBetweenGenerations);
			}
			TIMEOUT_ID = setTimeout(animate, intervalBetweenGenerations);
		}
		
		function pauseClickHandler() {
			clearTimeout(TIMEOUT_ID);
		}
		
		function resetClickHandler() {
			pauseClickHandler();
			updateGenerationCount(true);
			game.resetMatrixToZero(game.dataMatrix);
			generationHistory.length = 0;
			drawGrid();
		}
		
		const speedSlider = document.querySelector('#speed-slider');
		
		speedSlider.addEventListener('input', function () {
			intervalBetweenGenerations = this.value * 30;
		});
		
		document.getElementById('skip-button').addEventListener('click', skipGenerations);
		
		function skipGenerations() {
			const skipInput = document.getElementById('skip-input').value;
			const skipCount = parseInt(skipInput);
			if (!isNaN(skipCount) && skipCount > 0) {
				for (let i = 0; i < skipCount; i++) {
					stepGenerationHandler();
				}
			}
		}
		
		let TIMEOUT_ID;
		
		function main() {
			drawGrid();
		}
		
		function drawGrid() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			let areAllCellsDead = true;
		
			const regionWidth = canvas.width / 2;
			const regionHeight = canvas.height / 2;
			const colors = ['#ffcccc', '#ccffcc', '#ccccff', '#ffffcc']; // Colors for each region
		
			// Render background rectangles for each region
			for (let r = 0; r < 2; r++) {
				for (let c = 0; c < 2; c++) {
					ctx.fillStyle = colors[r * 2 + c];
					ctx.fillRect(c * regionWidth, r * regionHeight, regionWidth, regionHeight);
				}
			}

			for (let i = 0; i < ROWS; i++) {
				for (let j = 0; j < COLS; j++) {
					const cell = game.dataMatrix[i][j];
					if (cell.isAlive) {
						areAllCellsDead = false;
						const x = (i + 1) * 10;
						const y = (j + 1) * 10;
						let originalColor = colors[cell.species];
						let darkerColor = darkenColor(originalColor, 40); // Adjust darkness level as needed
						
						// Set the fillStyle to the darker color
						ctx.fillStyle = darkerColor;
						ctx.fillRect(y - 10, x - 10, 10, 10);
					}
				}
			}
		}
		function darkenColor(color, amount) {
			return '#' + color
				.replace(/^#/, '')
				.replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) - amount)).toString(16)).substr(-2));
		}
		
		// function toggleCell(row, col,CELL) {
		// 	game.toggleCell(row, col);
		// 	drawGrid();
		// }
		