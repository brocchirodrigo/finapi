const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement []
 */

const costumers = [];

// Middleware

app.use(express.json());

function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  
  const costumer = costumers.find(costumer => costumer.cpf === cpf);

  if (!costumer) {
    return response.status(400).json({ error: 'Cold not find the costumer' })
  }

  request.costumer = costumer;

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

  const costumerAlreadyExists = costumers.some((costumer) => costumer.cpf === cpf);

  if (costumerAlreadyExists) {
    return response.status(400).json({ error: 'Costumer already exists' })
  }

  costumers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  })

  return response.status(201).send();

});

app.use(verifyIfExistsAccountCPF);

app.get('/statement', (request, response) => {
  const { costumer } = request;

  const balance = getBalance(costumer.statement); 
  
  return response.json({ statement: costumer.statement, balance}) 
});

app.post('/deposit', (request, response) => {
  const { costumer } = request;
  const { description, amount } = request.body;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit"
  };

  costumer.statement.push(statementOperation);

  return response.status(201).json({ success: 'Deposit confirme in the date' })
})

app.post('/withdraw', (request, response) => {
  const { costumer } = request;
  const { description, amount } = request.body;

  const balance = getBalance(costumer.statement);

  if(balance.total < amount) {
    return response.status(400).json({ erro: 'Insufficient funds!' })
  }
  
  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "debit"
  };

  costumer.statement.push(statementOperation);

  return response.status(201).json({ success: 'Withdraw confirme in the date' })
})

app.get('/statement/date', (request, response) => {
  const { costumer } = request;
  const { date } = request.query;

  const dateFormat = new Date(date + ' 00:00');

  const statement = costumer.statement.filter(
    (statement) => 
    statement.created_at.toDateString() === new Date(dateFormat).toDateString())

  const balance = getBalance(statement); 
  
  return response.json({ dateStatement: date, statement, balance }) 
});


app.listen(3333);
