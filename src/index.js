const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();


const customers = [];
/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */

app.use(express.json());

app.post('/account', (request, response) => {
  const { name, cpf } = request.body;

  const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

  if (customerAlreadyExists) {
    return response.status(400).json({ error: 'Customer already exists' })
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  })

  console.log(customers)

  return response.status(201).send();

})

app.listen(3333);
