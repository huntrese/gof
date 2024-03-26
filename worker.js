// skipWorker.js

self.onmessage = function(event) {
    const skipCount = event.data;
    const skippedGenerations = [];

    for (let i = 0; i < skipCount; i++) {
        const newDataMatrix = [];
        for (let i = 0; i < game.rows; i++) {
            newDataMatrix[i] = [];
            for (let j = 0; j < game.cols; j++) {
                const isAlive = game.decideIfCellAliveInNextGen(i, j);
                const species = isAlive ? game.dataMatrix[i][j].species : -1;
                newDataMatrix[i][j] = { isAlive, species };
            }
        }
        skippedGenerations.push(newDataMatrix);
    }

    self.postMessage(skippedGenerations);
};
