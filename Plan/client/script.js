document.addEventListener('DOMContentLoaded', function() {
    // Данные приложения
    let projects = JSON.parse(localStorage.getItem('projects')) || [];
    let currentProjectId = null;

    // Элементы DOM
    const projectContainer = document.getElementById('projectContainer');
    const projectSelector = document.getElementById('projectSelector');
    
    // Кнопки
    const addProjectBtn = document.getElementById('addProject');
    
    // Модальные окна
    const projectModal = document.getElementById('projectModal');
    const departmentModal = document.getElementById('departmentModal');
    const employeeModal = document.getElementById('employeeModal');
    const taskModal = document.getElementById('taskModal');
    
    // Формы
    const projectForm = document.getElementById('projectForm');
    const departmentForm = document.getElementById('departmentForm');
    const employeeForm = document.getElementById('employeeForm');
    const taskForm = document.getElementById('taskForm');
    
    // Закрытие модальных окон
    const closeButtons = document.getElementsByClassName('close');
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    }
    
// Добавляем после других элементов DOM
const sendToTelegramBtn = document.getElementById('sendToTelegram');

// Добавляем после других обработчиков событий
sendToTelegramBtn.addEventListener('click', function() {
    if (!currentProjectId) {
        alert('Пожалуйста, выберите проект');
        return;
    }
    
    const project = getProjectById(currentProjectId);
    if (!project || project.tasks.length === 0) {
        alert('В проекте нет задач для отправки');
        return;
    }
    
    sendTasksToTelegram(project);
});

// Добавляем новую функцию для отправки задач
function sendTasksToTelegram(project) {
    // Здесь нужно указать токен вашего бота и chat_id
    const botToken = '8090544891:AAG8Umdt0cYHsY04amzEBwFsrrZKuMC0oAI';
    const chatId = '1963327915';
    
    // Формируем сообщение
    let message = `*Задачи проекта: ${project.name}*\n\n`;
    
    project.tasks.forEach((task, index) => {
        message += `*Задача ${index + 1}:*\n`;
        message += `Описание: ${task.description}\n`;
        message += `Сотрудник: ${getEmployeeName(project, task.employeeId)}\n`;
        message += `Отдел: ${getDepartmentName(project, task.departmentId)}\n`;
        message += `Срок: ${new Date(task.dueDate).toLocaleDateString('ru-RU')}\n`;
        message += `Приоритет: ${task.priority}\n`;
        message += `Статус: ${task.status}\n\n`;
    });
    
    // Кодируем сообщение для URL
    const encodedMessage = encodeURIComponent(message);
    
    // Отправляем запрос к API Telegram
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodedMessage}&parse_mode=Markdown`)
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                alert('Задачи успешно отправлены в Telegram!');
            } else {
                alert('Ошибка при отправке задач: ' + (data.description || 'Неизвестная ошибка'));
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при отправке задач');
        });
}

// Добавляем функцию в глобальную область видимости
window.sendTasksToTelegram = sendTasksToTelegram;

    // Открытие модальных окон
    addProjectBtn.addEventListener('click', function() {
        projectModal.style.display = 'block';
    });
    
    // Обработка форм
    projectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('projectName').value;
        addProject(name);
        projectForm.reset();
        projectModal.style.display = 'none';
    });
    
    departmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('departmentName').value;
        addDepartment(currentProjectId, name);
        departmentForm.reset();
        departmentModal.style.display = 'none';
    });
    
    employeeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('employeeName').value;
        const departmentId = document.getElementById('employeeDepartment').value;
        const position = document.getElementById('employeePosition').value;
        addEmployee(currentProjectId, name, departmentId, position);
        employeeForm.reset();
        employeeModal.style.display = 'none';
    });
    
    taskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const description = document.getElementById('taskDescription').value;
        const departmentId = document.getElementById('taskDepartment').value;
        const employeeId = document.getElementById('taskEmployee').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const priority = document.getElementById('taskPriority').value;
        addTask(currentProjectId, description, departmentId, employeeId, dueDate, priority);
        taskForm.reset();
        taskModal.style.display = 'none';
    });
    
    // Смена проекта
    projectSelector.addEventListener('change', function() {
        currentProjectId = this.value ? parseInt(this.value) : null;
        renderProject(currentProjectId);
    });
    
    // Инициализация приложения
    initApp();
    
    // Основные функции приложения
    function initApp() {
        updateProjectSelector();
        if (projects.length > 0) {
            currentProjectId = projects[0].id;
            projectSelector.value = currentProjectId;
            renderProject(currentProjectId);
        }
    }
    
    function addProject(name) {
        const project = {
            id: Date.now(),
            name: name,
            departments: [],
            employees: [],
            tasks: [],
            createdAt: new Date().toISOString()
        };
        projects.push(project);
        saveData();
        updateProjectSelector();
        currentProjectId = project.id;
        projectSelector.value = currentProjectId;
        renderProject(currentProjectId);
    }
    
    function deleteProject(id) {
        projects = projects.filter(p => p.id !== id);
        saveData();
        updateProjectSelector();
        if (projects.length > 0) {
            currentProjectId = projects[0].id;
            projectSelector.value = currentProjectId;
            renderProject(currentProjectId);
        } else {
            currentProjectId = null;
            projectContainer.innerHTML = '';
        }
    }
    
    function addDepartment(projectId, name) {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        const department = {
            id: Date.now(),
            name: name
        };
        project.departments.push(department);
        saveData();
        renderProject(projectId);
    }
    
    function deleteDepartment(projectId, departmentId) {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        project.departments = project.departments.filter(d => d.id !== departmentId);
        project.employees = project.employees.filter(e => e.departmentId !== departmentId);
        project.tasks = project.tasks.filter(t => t.departmentId !== departmentId);
        saveData();
        renderProject(projectId);
    }
    
    function addEmployee(projectId, name, departmentId, position) {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        const employee = {
            id: Date.now(),
            name: name,
            departmentId: parseInt(departmentId),
            position: position
        };
        project.employees.push(employee);
        saveData();
        renderProject(projectId);
    }
    
    function deleteEmployee(projectId, employeeId) {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        project.employees = project.employees.filter(e => e.id !== employeeId);
        project.tasks = project.tasks.filter(t => t.employeeId !== employeeId);
        saveData();
        renderProject(projectId);
    }
    
    function addTask(projectId, description, departmentId, employeeId, dueDate, priority) {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        const task = {
            id: Date.now(),
            description: description,
            departmentId: parseInt(departmentId),
            employeeId: parseInt(employeeId),
            dueDate: dueDate,
            priority: priority,
            status: 'Новая',
            createdAt: new Date().toISOString()
        };
        project.tasks.push(task);
        saveData();
        renderProject(projectId);
    }
    
    function updateTaskStatus(projectId, taskId, status) {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        const task = project.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = status;
            saveData();
            renderProject(projectId);
        }
    }
    
    function deleteTask(projectId, taskId) {
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        project.tasks = project.tasks.filter(t => t.id !== taskId);
        saveData();
        renderProject(projectId);
    }
    
    // Вспомогательные функции
    function getProjectById(projectId) {
        return projects.find(p => p.id === projectId);
    }
    
    function getDepartmentName(project, departmentId) {
        const department = project.departments.find(d => d.id === departmentId);
        return department ? department.name : 'Неизвестный отдел';
    }
    
    function getEmployeeName(project, employeeId) {
        const employee = project.employees.find(e => e.id === employeeId);
        return employee ? employee.name : 'Неизвестный сотрудник';
    }
    
    function countEmployeesInDepartment(project, departmentId) {
        return project.employees.filter(e => e.departmentId === departmentId).length;
    }
    
    function countTasksForEmployee(project, employeeId) {
        return project.tasks.filter(t => t.employeeId === employeeId).length;
    }
    
    // Обновление интерфейса
    function updateProjectSelector() {
        projectSelector.innerHTML = '';
        
        if (projects.length === 0) {
            projectSelector.innerHTML = '<option value="">Нет проектов</option>';
            return;
        }
        
        projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.name;
            projectSelector.appendChild(option);
        });
    }
    
    function renderProject(projectId) {
        if (!projectId) {
            projectContainer.innerHTML = '<p>Создайте новый проект или выберите существующий</p>';
            return;
        }
        
        const project = getProjectById(projectId);
        if (!project) return;
        
        projectContainer.innerHTML = `
            <div class="project" id="project-${project.id}">
                <div class="project-header">
                    <h2><i class="fas fa-project-diagram"></i> ${project.name}</h2>
                    <div class="project-actions">
                        <button onclick="openAddDepartmentModal(${project.id})">
                            <i class="fas fa-building"></i> Добавить отдел
                        </button>
                        <button onclick="openAddEmployeeModal(${project.id})">
                            <i class="fas fa-user-plus"></i> Добавить сотрудника
                        </button>
                        <button onclick="openAddTaskModal(${project.id})">
                            <i class="fas fa-plus-circle"></i> Добавить задачу
                        </button>
                        <button onclick="deleteProject(${project.id})" class="delete-btn">
                            <i class="fas fa-trash"></i> Удалить проект
                        </button>
                    </div>
                </div>
                <div class="project-content">
                    <div class="departments-section">
                        <div class="section-header">
                            <h3><i class="fas fa-building"></i> Отделы</h3>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>Кол-во сотрудников</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody id="departmentsTable-${project.id}"></tbody>
                        </table>
                    </div>
                    <div class="employees-section">
                        <div class="section-header">
                            <h3><i class="fas fa-users"></i> Сотрудники</h3>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Имя</th>
                                    <th>Отдел</th>
                                    <th>Должность</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody id="employeesTable-${project.id}"></tbody>
                        </table>
                    </div>
                    <div class="tasks-section">
                        <div class="section-header">
                            <h3><i class="fas fa-tasks"></i> Задачи</h3>
                            <div class="filters">
                                <select id="departmentFilter-${project.id}" onchange="filterTasks(${project.id})">
                                    <option value="">Все отделы</option>
                                </select>
                                <select id="employeeFilter-${project.id}" onchange="filterTasks(${project.id})">
                                    <option value="">Все сотрудники</option>
                                </select>
                                <select id="statusFilter-${project.id}" onchange="filterTasks(${project.id})">
                                    <option value="">Все статусы</option>
                                    <option value="Новая">Новая</option>
                                    <option value="В работе">В работе</option>
                                    <option value="Завершена">Завершена</option>
                                </select>
                            </div>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Описание</th>
                                    <th>Сотрудник</th>
                                    <th>Отдел</th>
                                    <th>Срок</th>
                                    <th>Приоритет</th>
                                    <th>Статус</th>
                                    <th>Действия</th>
                                </tr>
                            </thead>
                            <tbody id="tasksTable-${project.id}"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        renderDepartments(project);
        renderEmployees(project);
        renderTasks(project);
        updateFilters(project);
    }
    
    function renderDepartments(project) {
        const tableBody = document.getElementById(`departmentsTable-${project.id}`);
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        project.departments.forEach(department => {
            const row = document.createElement('tr');
            const employeeCount = countEmployeesInDepartment(project, department.id);
            
            row.innerHTML = `
                <td>${department.name}</td>
                <td>${employeeCount}</td>
                <td>
                    <button class="action-btn delete-btn" onclick="deleteDepartment(${project.id}, ${department.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    function renderEmployees(project) {
        const tableBody = document.getElementById(`employeesTable-${project.id}`);
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        project.employees.forEach(employee => {
            const row = document.createElement('tr');
            const taskCount = countTasksForEmployee(project, employee.id);
            
            row.innerHTML = `
                <td>${employee.name}</td>
                <td>${getDepartmentName(project, employee.departmentId)}</td>
                <td>${employee.position}</td>
                <td>
                    <button class="action-btn delete-btn" onclick="deleteEmployee(${project.id}, ${employee.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    function renderTasks(project, tasksToRender = null) {
        const tableBody = document.getElementById(`tasksTable-${project.id}`);
        if (!tableBody) return;
        
        const tasks = tasksToRender || project.tasks;
        tableBody.innerHTML = '';
        
        tasks.forEach(task => {
            const row = document.createElement('tr');
            const dueDate = new Date(task.dueDate);
            const formattedDate = dueDate.toLocaleDateString('ru-RU');
            const priorityClass = `priority-${task.priority.toLowerCase()}`;
            
            row.innerHTML = `
                <td>${task.description}</td>
                <td>${getEmployeeName(project, task.employeeId)}</td>
                <td>${getDepartmentName(project, task.departmentId)}</td>
                <td>${formattedDate}</td>
                <td class="${priorityClass}">${task.priority}</td>
                <td class="status-${task.status.toLowerCase().replace(' ', '-')}">${task.status}</td>
                <td>
                    ${task.status !== 'Завершена' ? `
                        <button class="action-btn complete-btn" onclick="updateTaskStatus(${project.id}, ${task.id}, 'Завершена')">
                            <i class="fas fa-check"></i> Завершить
                        </button>
                    ` : ''}
                    ${task.status !== 'В работе' ? `
                        <button class="action-btn edit-btn" onclick="updateTaskStatus(${project.id}, ${task.id}, 'В работе')">
                            <i class="fas fa-edit"></i> В работу
                        </button>
                    ` : ''}
                    <button class="action-btn delete-btn" onclick="deleteTask(${project.id}, ${task.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    function updateFilters(project) {
        const departmentFilter = document.getElementById(`departmentFilter-${project.id}`);
        const employeeFilter = document.getElementById(`employeeFilter-${project.id}`);
        
        if (departmentFilter) {
            departmentFilter.innerHTML = '<option value="">Все отделы</option>';
            project.departments.forEach(department => {
                const option = document.createElement('option');
                option.value = department.id;
                option.textContent = department.name;
                departmentFilter.appendChild(option);
            });
        }
        
        if (employeeFilter) {
            employeeFilter.innerHTML = '<option value="">Все сотрудники</option>';
            project.employees.forEach(employee => {
                const option = document.createElement('option');
                option.value = employee.id;
                option.textContent = `${employee.name} (${getDepartmentName(project, employee.departmentId)})`;
                employeeFilter.appendChild(option);
            });
        }
    }
    
    function filterTasks(projectId) {
        const project = getProjectById(projectId);
        if (!project) return;
        
        const departmentId = document.getElementById(`departmentFilter-${projectId}`).value;
        const employeeId = document.getElementById(`employeeFilter-${projectId}`).value;
        const status = document.getElementById(`statusFilter-${projectId}`).value;
        
        let filteredTasks = project.tasks;
        
        if (departmentId) {
            filteredTasks = filteredTasks.filter(t => t.departmentId === parseInt(departmentId));
        }
        
        if (employeeId) {
            filteredTasks = filteredTasks.filter(t => t.employeeId === parseInt(employeeId));
        }
        
        if (status) {
            filteredTasks = filteredTasks.filter(t => t.status === status);
        }
        
        renderTasks(project, filteredTasks);
    }
    
    function openAddDepartmentModal(projectId) {
        currentProjectId = projectId;
        departmentModal.style.display = 'block';
    }
    
    function openAddEmployeeModal(projectId) {
        currentProjectId = projectId;
        const project = getProjectById(projectId);
        if (!project) return;
        
        const dropdown = document.getElementById('employeeDepartment');
        dropdown.innerHTML = '<option value="">Выберите отдел</option>';
        project.departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department.id;
            option.textContent = department.name;
            dropdown.appendChild(option);
        });
        
        employeeModal.style.display = 'block';
    }
    
    function openAddTaskModal(projectId) {
        currentProjectId = projectId;
        const project = getProjectById(projectId);
        if (!project) return;
        
        const departmentDropdown = document.getElementById('taskDepartment');
        departmentDropdown.innerHTML = '<option value="">Выберите отдел</option>';
        project.departments.forEach(department => {
            const option = document.createElement('option');
            option.value = department.id;
            option.textContent = department.name;
            departmentDropdown.appendChild(option);
        });
        
        const employeeDropdown = document.getElementById('taskEmployee');
        employeeDropdown.innerHTML = '<option value="">Выберите сотрудника</option>';
        
        taskModal.style.display = 'block';
    }
    
    // Обновление списка сотрудников при изменении отдела в форме задачи
    document.getElementById('taskDepartment')?.addEventListener('change', function() {
        const project = getProjectById(currentProjectId);
        if (!project) return;
        
        const departmentId = this.value;
        const employeeDropdown = document.getElementById('taskEmployee');
        employeeDropdown.innerHTML = '<option value="">Выберите сотрудника</option>';
        
        if (!departmentId) return;
        
        const filteredEmployees = project.employees.filter(e => e.departmentId === parseInt(departmentId));
        filteredEmployees.forEach(employee => {
            const option = document.createElement('option');
            option.value = employee.id;
            option.textContent = `${employee.name} (${getDepartmentName(project, employee.departmentId)})`;
            employeeDropdown.appendChild(option);
        });
    });
    
    // Сохранение данных
    function saveData() {
        localStorage.setItem('projects', JSON.stringify(projects));
    }
    
    // Добавление функций в глобальную область видимости для обработки событий
    window.deleteProject = deleteProject;
    window.deleteDepartment = deleteDepartment;
    window.deleteEmployee = deleteEmployee;
    window.deleteTask = deleteTask;
    window.updateTaskStatus = updateTaskStatus;
    window.filterTasks = filterTasks;
    window.openAddDepartmentModal = openAddDepartmentModal;
    window.openAddEmployeeModal = openAddEmployeeModal;
    window.openAddTaskModal = openAddTaskModal;
});