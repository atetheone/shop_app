const express = require('express');
const path = require('path');

const server = express();

server.use(express.static(path.join(__dirname, 'dist', 'warehouse-frontend')));

server.get('/*', async (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'warehouse-frontend', 'index.html'));
});

const port = process.env.PORT || 4200;
server.listen(port, () => {
    console.log('Warehouse app running on port ' + port);
})
