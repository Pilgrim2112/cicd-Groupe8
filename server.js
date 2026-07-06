const express = require('express');
const app = express();
const PORT = process-env.PORT || 3000;

app.get('/', (req, res) => {
    res.status(200).json({ status: "success", message: "Hello Groupe8" });
});

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = server; // Export pour les tests
