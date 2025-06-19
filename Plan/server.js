const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client')));

// Функции для работы с данными
function readData() {
  try {
    return JSON.parse(fs.readFileSync('tasks_data.json', 'utf8'));
  } catch (err) {
    console.error('Error reading data:', err);
    return { projects: [], regulations: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync('tasks_data.json', JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing data:', err);
    return false;
  }
}

// Маршруты страниц
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'client', 'Register.html')));
app.get('/main', (req, res) => res.sendFile(path.join(__dirname, 'client', 'Main.html')));
app.get('/regulations', (req, res) => res.sendFile(path.join(__dirname, 'client', 'Reglament.html')));

// API для проектов
app.get('/api/projects', (req, res) => {
  const data = readData();
  res.json(data.projects || []);
});

app.post('/api/projects', (req, res) => {
  const data = readData();
  const newProject = {
    id: Date.now(),
    name: req.body.name,
    departments: [],
    employees: [],
    tasks: [],
    createdAt: new Date().toISOString()
  };
  
  data.projects.push(newProject);
  if (writeData(data)) {
    res.status(201).json(newProject);
  } else {
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// API для отделов
app.post('/api/projects/:projectId/departments', (req, res) => {
  const data = readData();
  const projectId = parseInt(req.params.projectId);
  const project = data.projects.find(p => p.id === projectId);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const newDepartment = {
    id: Date.now(),
    name: req.body.name
  };
  
  project.departments.push(newDepartment);
  
  if (writeData(data)) {
    res.status(201).json(newDepartment);
  } else {
    res.status(500).json({ error: 'Failed to save department' });
  }
});

// API для сотрудников
app.post('/api/projects/:projectId/employees', (req, res) => {
  const data = readData();
  const projectId = parseInt(req.params.projectId);
  const project = data.projects.find(p => p.id === projectId);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const newEmployee = {
    id: Date.now(),
    name: req.body.name,
    departmentId: req.body.departmentId,
    position: req.body.position
  };
  
  project.employees.push(newEmployee);
  
  if (writeData(data)) {
    res.status(201).json(newEmployee);
  } else {
    res.status(500).json({ error: 'Failed to save employee' });
  }
});

// API для задач
app.post('/api/projects/:projectId/tasks', (req, res) => {
  const data = readData();
  const projectId = parseInt(req.params.projectId);
  const project = data.projects.find(p => p.id === projectId);
  
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const newTask = {
    id: Date.now(),
    description: req.body.description,
    departmentId: req.body.departmentId,
    employeeId: req.body.employeeId,
    dueDate: req.body.dueDate,
    priority: req.body.priority,
    status: 'Новая',
    createdAt: new Date().toISOString()
  };
  
  project.tasks.push(newTask);
  
  if (writeData(data)) {
    res.status(201).json(newTask);
  } else {
    res.status(500).json({ error: 'Failed to save task' });
  }
});

// API для регламентов
app.get('/api/regulations', (req, res) => {
  const data = readData();
  res.json(data.regulations || []);
});

app.post('/api/regulations', (req, res) => {
  const data = readData();
  const newRegulation = {
    id: Date.now(),
    name: req.body.name,
    department: req.body.department,
    category: req.body.category,
    status: req.body.status || 'Активный',
    content: req.body.content,
    createdAt: new Date().toISOString()
  };
  
  data.regulations = data.regulations || [];
  data.regulations.push(newRegulation);
  
  if (writeData(data)) {
    res.status(201).json(newRegulation);
  } else {
    res.status(500).json({ error: 'Failed to save regulation' });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Available pages:');
  console.log(`- Registration: http://localhost:${PORT}/`);
  console.log(`- Task planner: http://localhost:${PORT}/main`);
  console.log(`- Regulations: http://localhost:${PORT}/regulations`);
});