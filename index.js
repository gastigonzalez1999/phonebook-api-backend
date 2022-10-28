const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const data = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

app.use(cors());
app.use(express.json());
app.use(express.static('build'));

app.use(morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(req.body)
    ].join(' ');
}));

app.get('/api/persons', (request, response) => {
    response.json(data);
});

app.get('/info', (request, response) => {
    const currentDate = new Date().toLocaleString();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    data.find({}).then(persons => {
        response.send(
            `
            <div>
                <p>Phonebook has info for ${persons.length} people</p>
            </div>
            <div>
                <p>${currentDate} (${timeZone})</p>
            </div>`
        )
        });
});

app.get('api/persons/:id', (request, response, next) => {
    const id = Number(request.params.id);
    const entry = data.find(entry => entry.id === id);
    if (entry) {
        response.json(entry)
    } else {
        response.status(404).end()
    }
});

app.delete('api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const entry = data.find(entry => entry.id !== id);
    
    response.status(204).end()
});

const generateId = () => {
    const maxId = data.length > 0
      ? Math.max(...data.map(n => n.id))
      : 0
    return maxId + 1
};

app.post('api/persons', (request, response, next) => {
    const body = request.body;

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'content missing'
        });
    }

    if (data.includes(body.name)) {
        return response.status(400).json({
            error: 'Name already exist'
        });
    }

    const entry = {
        name: body.name,
        number: body.number,
        important: body.important || false,
        id: generateId(),
    };

    data = data.concat(entry);

    response.json(entry);

});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
});