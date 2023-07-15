const express = require('express');
const path = require('path');

const server = express();

server.use(express.static(path.join(__dirname, 'dist', 'micro-shop-frontend')));

server.get('/*', async (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'micro-shop-frontend', 'index.html'));
});

const port = process.env.PORT || 4400;
server.listen(port, () => {
    console.log('Shop app running on port ' + port);
})
