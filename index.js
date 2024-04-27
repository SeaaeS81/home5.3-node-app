const http = require('http');
const { MongoClient } = require('mongodb');
const url = require('url');

// Установка подключения к MongoDB
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri, { useUnifiedTopology: true });

let db, collection;

client.connect(err => {
  // Подключение к базе данных и выбор коллекции
  db = client.db('bookDB');
  collection = db.collection('books');
});

const server = http.createServer((req, res) => {
  // Разбор URL запроса
  const reqUrl = url.parse(req.url, true);
  const id = reqUrl.pathname.split('/')[2]; // Получение id из URL

  if (reqUrl.pathname === '/books' && req.method === 'GET') {
    // Получение списка всех книг
    collection.find().toArray((err, items) => {
      res.end(JSON.stringify(items));
    });
  } else if (reqUrl.pathname === `/books/${id}` && req.method === 'GET') {
    // Получение конкретной книги по её идентификатору
    collection.findOne({ _id: id }, (err, item) => {
      res.end(JSON.stringify(item));
    });
  } else if (reqUrl.pathname === '/books' && req.method === 'POST') {
    // Добавление новой книги
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const book = JSON.parse(body);
      collection.insertOne(book, (err, result) => {
        res.end(JSON.stringify(result.ops[0]));
      });
    });
  } else if (reqUrl.pathname === `/books/${id}` && req.method === 'PUT') {
    // Обновление информации о книге
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const book = JSON.parse(body);
      collection.updateOne({ _id: id }, { $set: book }, (err, result) => {
        res.end(JSON.stringify(result));
      });
    });
  } else if (reqUrl.pathname === `/books/${id}` && req.method === 'DELETE') {
    // Удаление книги
    collection.deleteOne({ _id: id }, (err, result) => {
      res.end(JSON.stringify(result));
    });
  }
});

// Запуск сервера
server.listen(3000, () => console.log('Server is running on port 3000'));