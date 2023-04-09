const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const todos = [];

//array for testing purposes
// Add some TODO items to the array for testing purposes
todos.push({ id: 1, title: 'Finish project', content: 'Complete all the remaining tasks for the project', dueDate: new Date('2023-05-01'), status: 'PENDING' });
todos.push({ id: 2, title: 'Buy groceries', content: 'Purchase items from the grocery list', dueDate: new Date('2023-04-15'), status: 'PENDING' });
todos.push({ id: 3, title: 'Submit report', content: 'Submit the weekly progress report to the supervisor', dueDate: new Date('2023-04-10'), status: 'DONE' });

app.use(express.json());

app.use(
    bodyParser.json({
      type() {
        return true;
      },
    })
);

// 1 - Get Health
app.get("/todo/health", (req, res) => {
  console.log("GET:");
  console.log("   Query params: " + JSON.stringify(req.query));
  res.status(200).send("OK");
});

// Create new TODO
app.post('/todo', (req, res) => {
  const { title, content, dueDate } = req.body;

  // Check if TODO with this title already exists
  const existingTodo = todos.find(todo => todo.title === title);
  if (existingTodo) {
    return res.status(409).send(`Error: TODO with the title [${title}] already exists in the system`);
  }
  // gegregegegeg
  // Check if due date is in the future
  if (new Date(dueDate) < new Date()) {
    return res.status(409).send(`Error: Can’t create new TODO that its due date is in the past`);
  }

  // 2 - Create new TODO item with PENDING status
  const newTodo = {
    id: todos.length + 1,
    title,
    content,
    dueDate,
    status: 'PENDING'
  };
  todos.push(newTodo);

  res.status(200).send(`New TODO item created with ID ${newTodo.id}`);
});

// 3 - Get TODOs count
app.get('/todo/size', (req, res) => {
  const { status } = req.query;

  // Check if status is valid
  if (!['ALL', 'PENDING', 'LATE', 'DONE'].includes(status)) {
    return res.status(400).send(`Error: Invalid status ${status}`);
  }

  let count = 0;
  switch (status) {
    case 'ALL':
      count = todos.length;
      break;
    case 'PENDING':
      count = todos.filter(todo => todo.status === 'PENDING').length;
      break;
    case 'LATE':
      count = todos.filter(todo => todo.status === 'PENDING' && new Date(todo.dueDate) < new Date()).length;
      break;
    case 'DONE':
      count = todos.filter(todo => todo.status === 'DONE').length;
      break;
    default:
      break;
  }

  res.status(200).send(`Total number of TODOs with status ${status}: ${count}`);
});

// 4 - Get TODOs data
app.get('/todo/content', (req, res) => {
  const status = req.query.status;
  const sortBy = req.query.sortBy || 'ID';

  // validate status query parameter
  if (!['ALL', 'PENDING', 'LATE', 'DONE'].includes(status)) {
    return res.status(400).send('Bad Request');
  }

  // validate sortBy query parameter
  if (!['ID', 'DUE_DATE', 'TITLE'].includes(sortBy)) {
    return res.status(400).send('Bad Request');
  }

  // filter todos by status
  let filteredTodos;
  if (status === 'ALL') {
    filteredTodos = todos;
  } else if (status === 'LATE') {
    filteredTodos = todos.filter(todo => todo.dueDate < Date.now());
  } else {
    filteredTodos = todos.filter(todo => todo.status === status);
  }

  // sort todos by sortBy
  filteredTodos.sort((a, b) => {
    if (sortBy === 'DUE_DATE') {
      return a.dueDate - b.dueDate;
    } else if (sortBy === 'TITLE') {
      return a.title.localeCompare(b.title);
    } else {
      return a.id - b.id;
    }
  });

  // construct response
  const response = filteredTodos.map(todo => {
    return {
      id: todo.id,
      title: todo.title,
      content: todo.content,
      status: todo.status,
      dueDate: todo.dueDate
    };
  });
    res.status(200).json(response);
});

// 5 - Update TODO status

app.put('/todo', (req, res) => {
  const id = req.query.id;
  const status = req.query.status;
  
  // TODO: Check if id and status are valid values
  
  const todo = todos.find(todo => todo.id == id);
  if (!todo) {
    return res.status(404).json({ errorMessage: `Error: no such TODO with id ${id}` });
  }
  
  const oldStatus = todo.status;
  todo.status = status;
  
  res.status(200).send(oldStatus);
});

// 6 - Delete TODO

app.delete('/todo', (req, res) => {
  const id = req.query.id;

  // Check if TODO with given id exists
  const todo = todos.find((todo) => todo.id === parseInt(id));
  if (!todo) {
    return res.status(404).send({ errorMessage: `Error: no such TODO with id ${id}` });
  }

  // Remove TODO from list
  todos = todos.filter((todo) => todo.id !== parseInt(id));

  // Respond with the number of remaining TODOs
  res.status(200).send({ result: todos.length });
});


const server = app.listen(8496, () => {
  console.log("Server listening on port 8496...\n");
});
