require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'))

const Person = require('./models/person')

morgan.token('postData', (req, res) => {
  if (req.method === 'POST' && res.statusCode === 200) {
    return `{name: ${req.body.name}, number: ${req.body.number}}`
  }
})

app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then(people => response.json(people))
})

app.get('/info', (request, response) => {
  const timestamp = new Date()
  Person
    .find({})
    .then(people => response.send(`
    <p>Phonebook has info for ${people.length} people</p>
    <p>${timestamp.toDateString()} ${timestamp.toTimeString()}</p>
  `))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(err => next(err))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndDelete(request.params.id)
    .then(() => response.status(204).end())
    .catch(err => next(err))
})

app.post('/api/persons', (request, response, next) => {
  // const alreadyInPhonebookError = "This person or number is already in the phonebook"
  // const missingFieldError = "Contacts must have a name and a number"

  // if (!request.body.name || !request.body.number) {
  //   return response.status(404).json({ error: missingFieldError })
  // }
  // if (persons.find(p => p.name === request.body.name)) {
  //   return response.status(404).json({ error: alreadyInPhonebookError })
  // }

  const person = new Person({
    name: request.body.name,
    number: request.body.number
  })

  person
    .save()
    .then(savedPerson =>
      response.json(savedPerson))
    .catch(err => next(err))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => response.json(updatedPerson))
    .catch(err => next(err))
})

const errorHandler = (error, request, response, next) => {
  // console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
