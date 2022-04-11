const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))

morgan.token('postData', (req, res) => {
  if (req.method === 'POST') {
    return `{name: ${req.body.name}, number: ${req.body.number}}`
  }
})

let persons = [
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
]

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  const timestamp = new Date()
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${timestamp.toDateString()} ${timestamp.toTimeString()}</p>
  `)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

app.post('/api/persons', (request, response) => {
  const alreadyInPhonebookError = "This person or number is already in the phonebook"
  const missingFieldError = "Contacts must have a name and a number"

  if (!request.body.name || !request.body.number) {
    return response.status(404).json({ error: missingFieldError })
  }
  if (persons.find(p => p.name === request.body.name)) {
    return response.status(404).json({ error: alreadyInPhonebookError })
  }

  const person = {
    id: Math.floor(Math.random() * 100000),
    name: request.body.name,
    number: request.body.number
  }

  persons = persons.concat(person)

  response.status(201).json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))