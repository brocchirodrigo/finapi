const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */

const customers = [];

// Middleware

app.use(express.json());

function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  
  const customer = customers.find(customer => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: 'Cold not find the customer' })
  }

  request.customer = customer;

  return next();
}

function getBalance(statement) {
  const { credit, debit } = statement.reduce((accumulated, operation) => {
    switch (operation.type) {
      case 'credit':
        accumulated.credit += operation.amount
        break
      case 'debit':
        accumulated.debit += operation.amount
      default:
        break
    }
    
    return accumulated
      
    }, 
    {
      credit: 0,
      debit: 0,
      total: 0
    }
  )

  const total = credit - debit

  return { credit, debit, total };
}

app.post('/account', (request, response) => {
  const { name, cpf } = request.body;

  const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

  if (customerAlreadyExists) {
    return response.status(400).json({ error: 'customer already exists' })
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  })

  return response.status(201).send();

});

app.use(verifyIfExistsAccountCPF);

app.get('/statement', (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement); 
  
  return response.json({ statement: customer.statement, balance}) 
});

app.post('/deposit', (request, response) => {
  const { customer } = request;
  const { description, amount } = request.body;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  };

  customer.statement.push(statementOperation);

  return response.status(201).json({ success: 'Deposit confirme in the date' })
})

app.post('/withdraw', (request, response) => {
  const { customer } = request;
  const { description, amount } = request.body;

  const balance = getBalance(customer.statement);

  if(balance.total < amount) {
    return response.status(400).json({ erro: 'Insufficient funds!' })
  }
  
  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "debit"
  };

  customer.statement.push(statementOperation);

  return response.status(201).json({ success: 'Withdraw confirme in the date' })
})

app.get('/statement/date', (request, response) => {
  const { customer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + ' 00:00');

  const statement = customer.statement.filter(
    (statement) => 
    statement.created_at.toDateString() === new Date(dateFormat).toDateString())

  const balance = getBalance(statement); 
  
  return response.json({ dateStatement: date, statement, balance }) 
});

app.put('/account', (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name

  return response.status(201).json({ name: customer.name })
})

app.get('/account', (request, response) => {
  const { customer } = request;
  
  return response.json(customer);
})

app.delete('/account', (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.status(204).send();
})

app.get('/balance', (request, response) => {
  const { customer } = request;

  const balance = getBalance(customer.statement)

  return response.status(200).json(balance)
})


app.listen(3333);
