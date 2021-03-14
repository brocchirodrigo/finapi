const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();


const costumers = [];
/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */

app.use(express.json());

app.post('/account', (request, response) => {
  const { name, cpf } = request.body;
  const id = uuidv4();

  costumers.push({
    cpf,
    name,
    id,
    statement: [],
  })

  console.log(costumers)

  return response.status(201).send();

})

app.listen(3333);
