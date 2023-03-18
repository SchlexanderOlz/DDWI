const express = require("express")
const app = express()
const fs = require("fs")
const sqlite = require("sqlite3")
const multer = require('multer');
const document_db_dir = "db/documents.sqlite"

const upload = multer({ dest: 'temp/' });
const documents = new sqlite.Database(document_db_dir, (error) => {
    console.log(error)
    console.log("[-] Couldn't open Database: documents")
})

const port = 3900

app.use(express.static('public'))
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });


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

app.get('/upload_page', (req, res) => {
    fs.readFile('pages/upload.html', (error, data) => {
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
        res.send(rows);
      });
})


app.get('/api/get_type_entrys', (req, res) => {
    documents.all('SELECT * FROM type', [], (err, rows) => {
        if (err) {
          throw err;
        }
        res.send(rows);
      });
})


app.get('/api/download/*', (req, res) => {
    const filename = req.params[0];
    const filepath = 'db/docs/' + filename;
    res.download(filepath, (err) => {
      if (err) {
        // Handle error
        console.error(err);
        res.status(404).send('File not found');
      }
    });
})


app.post('/api/drop', upload.single('tmp'), (req, res) => {
    console.log(req.file)
    fs.rename(req.file.path, 'temp/tmp.pdf', (err) => {
        if (err) {
            console.log('[-] Wrong file type')
            res.send('didnt work')
        } else {
            console.log('File saved as PDF');
        }
    });
    res.send('File uploaded!');
})


app.use(express.json())
app.post('/api/finish_upload', (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const type = req.body.type;
  
    const tempFilePath = 'temp/tmp.pdf';
    const newFileName = `${name}-${Date.now()}.pdf`; // Make this dynamic in future

    let type_id; 
    documents.all(`SELECT id FROM type WHERE name = ?`, [type], (error, rows) => {
        if (error) {
            console.log(error)
        } else {
            type_id = rows
        }
    

        const sql = `INSERT INTO documents (name, description, path, type_id) VALUES(?, ?, ?, ?)`
        documents.run(sql, [name, description, `${newFileName}`, type_id[0].id])
    
        fs.rename(tempFilePath, `db/docs/${newFileName}`, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error moving file');
        }
    
        // File moved successfully, do something with the new file path
        const newPath = `uploads/${newFileName}`;
        console.log(`File moved to ${newPath}`);
        // Send response to client
        res.send('File uploaded and moved!');
        });
    })
})


app.put('/api/new_type', (req, res) => {
    const sql = `INSERT INTO type (name) VALUES(?)`
    documents.run(sql, [req.body.name])
    res.end()
})



app.listen(port, (error) => {
    if (error) {
        console.log(error)
        console.log('[-] Failed to start server')
    } else {
        console.log('[*] Server listening on port ' + port)
    }

})