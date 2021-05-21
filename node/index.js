const process = require('process');
const express = require('express');

const app = express();
const port = 3000;
const config = {
    host: 'db',
    user: 'root',
    password: 'root',
    database:'nodedb'
};
const mysql = require('mysql')
const connection = mysql.createConnection(config)

async function query(qry, params) {
    return new Promise((resolve, reject) => {
        connection.query(qry, params, (error, result) => {
            if (error) reject(error);

            resolve(result);
        })
    });
}

async function createTableIfInexistent() {
    const cmd = `CREATE TABLE IF NOT EXISTS people (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    )`;

    query(cmd);
}

async function createPerson(name) {
    const cmd = `INSERT INTO people(name) values(?)`;

    return query(cmd, [name]);
}

async function queryPeople() {
    const qry = `SELECT * FROM people ORDER BY name ASC`;

    return query(qry);
}

async function buildHtml() {
    const people = await queryPeople();

    var listItems = '';

    people.forEach(person => listItems += `<li>${person.name}</li>`)

    const html = `
        <h1>Full Cycle</h1>
        <ul>
            ${listItems}
        </ul>`;
    
    return html;
}

app.get('/', async (req, res) => {
    await createPerson(`full cycle ${new Date().getTime()}`);

    const html = await buildHtml();

    res.send(html);
})

app.listen(port, async ()=> {
    console.log('Rodando na porta ' + port);

    await createTableIfInexistent();
})

function bye() {
    console.log('bye!');
    connection.end();
}

process.on('SIGINT', bye);
process.on('SIGTERM', bye);
process.on('exit', bye);