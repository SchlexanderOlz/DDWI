const express = require("express")
const app = express()
const fs = require("fs")
const sqlite = require("sqlite3")
const multer = require('multer');
const document_db_dir = "db/documents.sqlite"
const db_setup_path = "db/setup.sql"
const path = require('path')

const upload = multer({ dest: 'temp/' });
const documents = new sqlite.Database(document_db_dir, (error) => {
    if (error) {
        console.log(error)
        console.log("[-] Couldn't open Database: documents")
    } else {
        SetupDB()
    }
})

const port = 3900

function SetupDB() {
    const content = fs.readFileSync(db_setup_path, "utf-8")

    let statements = content.split(";")
    statements.pop()

    for (let statement of statements) {
        documents.run(statement)
    }
}

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


function get_sql_entries() {
    return new Promise((resolve, reject) => {
        documents.all('SELECT documents.id, documents.name, documents.description, type.name AS type_name, documents.path AS Download FROM documents INNER JOIN type ON documents.type_id = type.id', [], (err, rows) => {
          if (err) {
            reject(err);
          }
          resolve(rows);
        });
      });
}


app.get('/api/get_entries', (req, res) => {
    get_sql_entries().then((rows) => {
        res.send(rows)
    })
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
    const fileExtension = req.body.type.split(".").pop(); // Change to simple split
    console.log(fileExtension)
    fs.rename(req.file.path, `temp/tmp.${fileExtension}`, (err) => {
        if (err) {
            console.log('[-] Wrong file type')
        } else {
            console.log('File saved');
        }
    });
    res.send('File uploaded!');
});


app.use(express.json())
app.post('/api/finish_upload', (req, res) => {
    const name = req.body.name;
    const description = req.body.description;
    const type = req.body.type;
  
    var extension


    fs.readdir("temp", (err, files) => {
        if (err) {
            console.log(err)
            return
        }

        extension = path.extname(files[0]);

        for (i = 1; i < files.length; i++) {
            fs.rm(files[i]) // Just in case
        }
      
        // Use extension to create new file name
        const newFileName = `${name}-${Date.now()}${extension}`; // Make this dynamic in future
        const temp_dir = 'temp/tmp' + extension

        let type_id 
        documents.all(`SELECT id FROM type WHERE name = ?`, [type], (error, rows) => {
            if (error) {
                console.log(error)
            } else {
                type_id = rows
            }
        

            const sql = `INSERT INTO documents (name, description, path, type_id) VALUES(?, ?, ?, ?)`
            documents.run(sql, [name, description, `${newFileName}`, type_id[0].id])
        
            fs.rename(temp_dir, `db/docs/${newFileName}`, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error moving file');
            }
        
            // File moved successfully, do something with the new file path
            const newPath = `uploads/${newFileName}`;
            console.log(`[*] File moved to ${newPath}`);
            // Send response to client
            res.send('File uploaded and moved!');
            });
        })
    })
})


app.put('/api/delete_entry', (req, res) => {
    const id = req.body.id
    documents.all("SELECT path FROM documents WHERE id = ?", [id], (error, rows) => {
        fs.rm(`db/docs/${rows[0].path}`, (err) => {
            if (err) {
                console.log(err)
            }
        })
    })
    documents.run("DELETE FROM documents WHERE id = ?", [id])
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