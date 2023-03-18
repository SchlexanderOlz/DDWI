const express = require("express")
const app = express()
const fs = require("fs")
const sqlite = require("sqlite3")
const fileUpload = require('express-fileupload');
const document_db_dir = "db/documents.sqlite"

const documents = new sqlite.Database(document_db_dir, (error) => {
    console.log(error)
    console.log("Couldn't open Database: documents")
})

const port = 3900

app.use(express.static('public'))


app.get('/', (req, res) => {
    fs.readFile('pages/index.html', (error, data) => {
        if (error) {
            res.writeHead(404)
            console.log(error)
            console.log('[-] Couldnt load file index.html')
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.write(data)
        }
        res.end()
    })
})


app.get('/api/get_entries', (req, res) => {
    documents.all('SELECT documents.id, documents.name, documents.description, type.name AS type_name, documents.path AS Download FROM documents INNER JOIN type ON documents.type_id = type.id', [], (err, rows) => {
        if (err) {
          throw err;
        }
        // Send the results back as a response to the client
        res.send(rows);
      });
})


app.get('/api/download/*', (req, res) => {
    const filename = req.params[0];
    const filepath = 'temp/' + filename;
    res.download(filepath, (err) => {
      if (err) {
        // Handle error
        console.error(err);
        res.status(404).send('File not found');
      }
    });
})

app.use(express.json())
app.post('/api/add_entry', (error, data) => {

})



app.listen(port, (error) => {
    if (error) {
        console.log(error)
        console.log('[-] Failed to start server')
    } else {
        console.log('[*] Server listening on port ' + port)
    }

})