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
			constructor(row, col, kind = -1) {
				this.row = row;
				this.col = col;
				this.isAlive = false;
				this.species = kind;
				this.isKiller = false; // New property to identify the killer cells
			}
		
			toggle(who) {
				this.isAlive = !this.isAlive;
				this.species = who;
			}
		}
		
		class GameOfLife {
			constructor(rows, cols) {
				this.rows = rows;
				this.cols = cols;
				this.dataMatrix = this.createMatrix(rows, cols);
				this.terrainMatrix = this.generateTerrain(rows, cols); // Added terrain matrix
			 // Define center coordinates of the circular infected area
				this.infectedAreaCenterX = Math.floor(rows / 2);
				this.infectedAreaCenterY = Math.floor(cols / 2);
				this.infectedAreaRadius = 20; // Radius of the infected area
		 	}
			 isInInfectedArea(row, col) {
				// Calculate the distance from the cell to the center of the infected area
				const distance = Math.sqrt((row - this.infectedAreaCenterX) ** 2 + (col - this.infectedAreaCenterY) ** 2);
				// Check if the distance is within the radius of the infected area
				return distance <= this.infectedAreaRadius;
			}

			generateTerrain(rows, cols) {
				const terrainMatrix = [];
				
				// Perlin noise parameters
				const scale = 0.09; // Adjust this value to change the scale of the terrain features
				const xOffset = Math.random() * 1; // Randomize the offset for variety
				const yOffset = Math.random() * 1;
				
				// Perlin noise function
				function perlin2D(x, y) {
					const X = Math.floor(x) & 255,
						Y = Math.floor(y) & 255;
					
					x -= Math.floor(x);
					y -= Math.floor(y);
					
					const u = fade(x),
						v = fade(y);
					
					const A = p[X] + Y,
						AA = p[A],
						AB = p[A + 1],
						B = p[X + 1] + Y,
						BA = p[B],
						BB = p[B + 1];
					
					return lerp(v, lerp(u, grad(AA, x, y), grad(BA, x - 1, y)),
						lerp(u, grad(AB, x, y - 1), grad(BB, x - 1, y - 1)));
				}
				
				function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
				function lerp(t, a, b) { return a + t * (b - a); }
				function grad(hash, x, y) {
					const h = hash & 15;
					const u = h < 8 ? x : y,
						v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
					return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
				}
				
				const p = [];
				for (let i = 0; i < 256; i++) {
					p.push(Math.floor(Math.random() * 256));
				}
				
				// Generate terrain matrix
				for (let i = 0; i < rows; i++) {
					terrainMatrix[i] = new Array(cols).fill(0); // Initialize with all cells as flat
				}
				
				// Populate terrain matrix with mountainous terrain based on Perlin noise
				for (let i = 0; i < rows; i++) {
					for (let j = 0; j < cols; j++) {
						const perlinValue = perlin2D(i * scale + xOffset, j * scale + yOffset);
						// Threshold value to determine mountainous terrain
						if (perlinValue > 0.2) { // Adjust threshold value for more contiguous mountain ranges
							terrainMatrix[i][j] = 1; // Set as mountainous terrain
						}
					}
				}
				
				return terrainMatrix;
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
					// Set killer status based on species number
					this.dataMatrix[row][col].isKiller = Math.random() < 1 / (species + 1);
				} else {
					// Cell is already alive, just update species
					this.dataMatrix[row][col].species = species;
				}
			}
			
			
		
			decideIfCellAliveInNextGen(row, col) {
				const cell = this.dataMatrix[row][col];
				const neighborsData = this.numberOfNeighbours(row, col, cell.species);
			
				// Check if the cell is within the infected area
				const isInInfectedArea = this.isInInfectedArea(row, col);
			
				// Check if the current cell is a mountain cell
				const isMountainCell = this.terrainMatrix[row][col] === 1;
			
				// Check if the cell is inside its own region
				const isInOwnRegion = (row < this.rows / 2 && col < this.cols / 2 && cell.species === 0) ||
									  (row < this.rows / 2 && col >= this.cols / 2 && cell.species === 1) ||
									  (row >= this.rows / 2 && col < this.cols / 2 && cell.species === 2) ||
									  (row >= this.rows / 2 && col >= this.cols / 2 && cell.species === 3);
			
				if (cell.isAlive) {
					if (neighborsData.allies === 3 || neighborsData.allies === 2 || isInOwnRegion) {
						return true;
					} else {
						if (neighborsData.allies === 4 && Math.round(cell.species / 8 + Math.random()) === 1) {
							return true;
						}
						return false;
					}
				} else {
					if (isMountainCell) {
						// Cell is on mountain terrain, prevent it from becoming alive
						return false;
					}
			
					if (isInOwnRegion) {
						// Cell is inside its own region, prevent it from dying of underpopulation
						return true;
					}
			
					if (neighborsData.allies === 3 || (neighborsData.allies === 4 && this.terrainMatrix[row][col] === 1)) {
						cell.species = neighborsData.majoritySpecies;
						return true;
					} else {
						// Check if the cell is a killer cell and if it can convert the neighbor
						if (cell.isKiller && neighborsData.enemies > 0) {
							return true;
						}
			
						if (cell.species === 0 && Math.round(Math.random()-0.3) === 0) {
							return true;
						}
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
							// Check if the neighbor is an enemy and determine if enemy converts species
							if (neighborCell.species !== -1 && currentSpecies !== neighborCell.species) {
								enemies++;
								// if (currentSpecies === 0){
								// 	if (Math.round(Math.random()+0.4)==1){
								// 		enemies --;
								// 	}
								// }
								if (enemies >= 4) {
									// Convert the species of the current cell to the species of the majority neighboring cell
									if (Math.round(currentSpecies*Math.random()-0.4)==1 && currentSpecies!=-1){
										this.dataMatrix[row][col].species = neighborCell.species;

									}
									// this.dataMatrix[row][col].species = neighborCell.species;

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
						newDataMatrix[i][j].species = -1;
						if (newDataMatrix[i][j].isAlive){
							newDataMatrix[i][j].species = this.dataMatrix[i][j].species; // Copy species information
						}
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
				}, 5);
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
			intervalBetweenGenerations = this.value * 20;
		});
		
		document.getElementById('skip-button').addEventListener('click', skipGenerations);
		
		async function skipGenerations() {
			const skipInput = document.getElementById('skip-input').value;
			const skipCount = parseInt(skipInput);
			if (!isNaN(skipCount) && skipCount > 0) {
				for (let i = 0; i < skipCount; i++) {
					await skipGeneration();
				}
			}
		}
		
		async function skipGeneration() {
			return new Promise((resolve) => {
				const newDataMatrix = game.createMatrix(game.rows, game.cols);
				for (let i = 0; i < game.rows; i++) {
					for (let j = 0; j < game.cols; j++) {
						newDataMatrix[i][j].isAlive = game.decideIfCellAliveInNextGen(i, j);
						newDataMatrix[i][j].species = -1;
						if (newDataMatrix[i][j].isAlive) {
							newDataMatrix[i][j].species = game.dataMatrix[i][j].species; // Copy species information
						}
					}
				}
				resolve(newDataMatrix);
			}).then((newDataMatrix) => {
				game.dataMatrix = newDataMatrix; // Replace the main grid with the skipped generation
				drawGrid();
			});
		}
		
		
		
		let TIMEOUT_ID;
		let skipWorker;

		function main() {
			drawGrid();

			// Initialize skip worker
			skipWorker = new Worker('skipWorker.js');
		}
		
		function drawGrid() {
			// Create an off-screen canvas for double buffering
			const offscreenCanvas = document.createElement('canvas');
			offscreenCanvas.width = canvas.width;
			offscreenCanvas.height = canvas.height;
			const offscreenCtx = offscreenCanvas.getContext('2d');
		
			offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
			let areAllCellsDead = true;
		
			const regionWidth = canvas.width / 2;
			const regionHeight = canvas.height / 2;
			const colors = ['#ffcccc', '#ccffcc', '#ccccff', '#ffffcc']; // Colors for each region
		
			// Render background rectangles for each region
			for (let r = 0; r < 2; r++) {
				for (let c = 0; c < 2; c++) {
					offscreenCtx.fillStyle = colors[r * 2 + c];
					offscreenCtx.fillRect(c * regionWidth, r * regionHeight, regionWidth, regionHeight);
				}
			}
		
			// Load cell image
			const cellImage = new Image();
			cellImage.src = 'cell.png';
		
			cellImage.onload = function () {
				for (let i = 0; i < ROWS; i++) {
					for (let j = 0; j < COLS; j++) {
						const cell = game.dataMatrix[i][j];
						const terrain = game.terrainMatrix[i][j]; // Get terrain information
		
						if (cell.isAlive) {
							areAllCellsDead = false;
							const x = (i + 1) * 10;
							const y = (j + 1) * 10;
		
							if (Math.random() < 0.9) {
								DARKEN = "1";
								let originalColor = colors[cell.species];
								let darkerColor = originalColor.replace("c", DARKEN); // Adjust darkness level as needed
								offscreenCtx.fillStyle = darkerColor;
								offscreenCtx.fillRect(j * 10, i * 10, 10, 10);
							} else {
								// Draw cell normally
								offscreenCtx.drawImage(cellImage, y - 10, x - 10, 10, 10);
							}
						} else if (terrain === 1) { // If cell is not alive but terrain is mountainous
							offscreenCtx.fillStyle = "#555"; // Color for mountainous terrain
							offscreenCtx.fillRect(j * 10, i * 10, 10, 10); // Render mountain
						}
					}
				}
		
				// Copy the off-screen canvas to the visible canvas
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(offscreenCanvas, 0, 0);
		
				if (areAllCellsDead) {
					pauseClickHandler();
				}
			};
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
		