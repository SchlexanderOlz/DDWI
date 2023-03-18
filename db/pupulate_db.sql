CREATE TABLE IF NOT EXISTS type (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);
INSERT INTO type (name) VALUES ('Versicherungen');


CREATE TABLE IF NOT EXISTS documents (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, description TEXT, path TEXT, type_id INTEGER, FOREIGN KEY (type_id) REFERENCES type(id));
INSERT INTO documents (name, description, path, type_id) VALUES ('Versicherung', 'Eine Versicherung', 'sos.pdf', 1);
