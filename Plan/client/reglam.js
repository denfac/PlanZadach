document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const addRegulationBtn = document.getElementById('addRegulation');
    const regulationModal = document.getElementById('regulationModal');
    const viewModal = document.getElementById('viewModal');
    const regulationForm = document.getElementById('regulationForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const editBtn = document.getElementById('editBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const archiveBtn = document.getElementById('archiveBtn');
    const regulationsTable = document.getElementById('regulationsTable');
    const searchInput = document.getElementById('searchInput');
    const departmentFilter = document.getElementById('departmentFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    
    // Закрытие модальных окон
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            regulationModal.style.display = 'none';
            viewModal.style.display = 'none';
        });
    });
    
    // Закрытие при клике вне модального окна
    window.addEventListener('click', function(event) {
        if (event.target === regulationModal) {
            regulationModal.style.display = 'none';
        }
        if (event.target === viewModal) {
            viewModal.style.display = 'none';
        }
    });
    
    // Данные регламентов (в реальном приложении это было бы API)
    let regulations = JSON.parse(localStorage.getItem('regulations')) || [];
    let currentRegulationId = null;
    
    // Инициализация приложения
    renderRegulations();
    
    // Открытие модального окна для добавления регламента
    addRegulationBtn.addEventListener('click', function() {
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-book"></i> Добавить регламент';
        document.getElementById('regulationId').value = '';
        regulationForm.reset();
        regulationModal.style.display = 'block';
    });
    
    // Отмена редактирования
    cancelBtn.addEventListener('click', function() {
        regulationModal.style.display = 'none';
    });
    
    // Обработка формы регламента
    regulationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = document.getElementById('regulationId').value;
        const name = document.getElementById('regulationName').value;
        const department = document.getElementById('regulationDepartment').value;
        const category = document.getElementById('regulationCategory').value;
        const status = document.getElementById('regulationStatus').value;
        const content = document.getElementById('regulationContent').value;
        
        if (id) {
            // Редактирование существующего регламента
            updateRegulation(id, name, department, category, status, content);
        } else {
            // Добавление нового регламента
            addRegulation(name, department, category, status, content);
        }
        
        regulationModal.style.display = 'none';
        renderRegulations();
    });
    
    // Поиск регламентов
    searchInput.addEventListener('input', function() {
        renderRegulations();
    });
    
    // Фильтрация регламентов
    departmentFilter.addEventListener('change', renderRegulations);
    categoryFilter.addEventListener('change', renderRegulations);
    statusFilter.addEventListener('change', renderRegulations);
    
    // Функция добавления регламента
    function addRegulation(name, department, category, status, content) {
        const newRegulation = {
            id: Date.now(),
            name,
            department,
            category,
            status,
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        regulations.push(newRegulation);
        saveRegulations();
    }
    
    // Функция обновления регламента
    function updateRegulation(id, name, department, category, status, content) {
        const regulation = regulations.find(r => r.id == id);
        if (regulation) {
            regulation.name = name;
            regulation.department = department;
            regulation.category = category;
            regulation.status = status;
            regulation.content = content;
            regulation.updatedAt = new Date().toISOString();
            
            saveRegulations();
        }
    }
    
    // Функция архивирования регламента
    function archiveRegulation(id) {
        const regulation = regulations.find(r => r.id == id);
        if (regulation) {
            regulation.status = 'archived';
            regulation.updatedAt = new Date().toISOString();
            
            saveRegulations();
            renderRegulations();
            viewModal.style.display = 'none';
        }
    }
    
    // Функция сохранения регламентов в localStorage
    function saveRegulations() {
        localStorage.setItem('regulations', JSON.stringify(regulations));
    }
    
    // Функция отображения регламентов в таблице
    function renderRegulations() {
        const searchTerm = searchInput.value.toLowerCase();
        const department = departmentFilter.value;
        const category = categoryFilter.value;
        const status = statusFilter.value;
        
        // Фильтрация регламентов
        let filteredRegulations = regulations.filter(regulation => {
            const matchesSearch = regulation.name.toLowerCase().includes(searchTerm) || 
                                 regulation.content.toLowerCase().includes(searchTerm);
            const matchesDepartment = department ? regulation.department === department : true;
            const matchesCategory = category ? regulation.category === category : true;
            const matchesStatus = status ? regulation.status === status : true;
            
            return matchesSearch && matchesDepartment && matchesCategory && matchesStatus;
        });
        
        // Сортировка по дате обновления (новые сначала)
        filteredRegulations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        // Очистка таблицы
        regulationsTable.innerHTML = '';
        
        // Заполнение таблицы
        if (filteredRegulations.length === 0) {
            regulationsTable.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center;">Регламенты не найдены</td>
                </tr>
            `;
            return;
        }
        
        filteredRegulations.forEach(regulation => {
            const row = document.createElement('tr');
            const date = new Date(regulation.updatedAt);
            const formattedDate = date.toLocaleDateString('ru-RU');
            
            row.innerHTML = `
                <td>${regulation.name}</td>
                <td>${regulation.department}</td>
                <td>${getCategoryName(regulation.category)}</td>
                <td>${formattedDate}</td>
                <td class="status-${regulation.status}">${getStatusName(regulation.status)}</td>
                <td>
                    <button class="action-btn view-btn" data-id="${regulation.id}">
                        <i class="fas fa-eye"></i> Просмотр
                    </button>
                    <button class="action-btn edit-btn" data-id="${regulation.id}">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                </td>
            `;
            
            regulationsTable.appendChild(row);
        });
        
        // Добавление обработчиков событий для кнопок в таблице
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                viewRegulation(id);
            });
        });
        
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                editRegulation(id);
            });
        });
    }
    
    // Функция просмотра регламента
    function viewRegulation(id) {
        const regulation = regulations.find(r => r.id == id);
        if (!regulation) return;
        
        document.getElementById('viewTitle').textContent = regulation.name;
        document.getElementById('viewDepartment').textContent = regulation.department;
        document.getElementById('viewCategory').textContent = getCategoryName(regulation.category);
        document.getElementById('viewStatus').textContent = getStatusName(regulation.status);
        
        const date = new Date(regulation.updatedAt);
        document.getElementById('viewDate').textContent = date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        document.getElementById('viewContent').innerHTML = formatContent(regulation.content);
        
        // Установка обработчиков для кнопок
        editBtn.setAttribute('data-id', id);
        archiveBtn.setAttribute('data-id', id);
        
        // Показываем/скрываем кнопку архивации в зависимости от статуса
        if (regulation.status === 'archived') {
            archiveBtn.innerHTML = '<i class="fas fa-box-open"></i> Восстановить';
            archiveBtn.classList.remove('btn-danger');
            archiveBtn.classList.add('btn-secondary');
        } else {
            archiveBtn.innerHTML = '<i class="fas fa-archive"></i> В архив';
            archiveBtn.classList.add('btn-danger');
            archiveBtn.classList.remove('btn-secondary');
        }
        
        currentRegulationId = id;
        viewModal.style.display = 'block';
    }
    
    // Функция редактирования регламента
    function editRegulation(id) {
        const regulation = regulations.find(r => r.id == id);
        if (!regulation) return;
        
        document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Редактировать регламент';
        document.getElementById('regulationId').value = regulation.id;
        document.getElementById('regulationName').value = regulation.name;
        document.getElementById('regulationDepartment').value = regulation.department;
        document.getElementById('regulationCategory').value = regulation.category;
        document.getElementById('regulationStatus').value = regulation.status;
        document.getElementById('regulationContent').value = regulation.content;
        
        currentRegulationId = id;
        regulationModal.style.display = 'block';
    }
    
    // Обработчики для кнопок в модальном окне просмотра
    editBtn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        viewModal.style.display = 'none';
        editRegulation(id);
    });
    
    archiveBtn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        archiveRegulation(id);
    });
    
    downloadBtn.addEventListener('click', function() {
        const regulation = regulations.find(r => r.id == currentRegulationId);
        if (regulation) {
            downloadRegulation(regulation);
        }
    });
    
    // Функция скачивания регламента
    function downloadRegulation(regulation) {
        const content = `
            Регламент: ${regulation.name}
            Отдел: ${regulation.department}
            Категория: ${getCategoryName(regulation.category)}
            Статус: ${getStatusName(regulation.status)}
            Дата обновления: ${new Date(regulation.updatedAt).toLocaleDateString('ru-RU')}
            
            ${regulation.content}
        `;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${regulation.name}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Вспомогательные функции
    function getCategoryName(category) {
        const categories = {
            'workflow': 'Рабочие процессы',
            'safety': 'Безопасность',
            'communication': 'Коммуникации',
            'documentation': 'Документооборот',
            'quality': 'Контроль качества'
        };
        return categories[category] || category;
    }
    
    function getStatusName(status) {
        const statuses = {
            'active': 'Активный',
            'draft': 'Черновик',
            'archived': 'Архивный'
        };
        return statuses[status] || status;
    }
    
    function formatContent(content) {
        // Простое форматирование текста (в реальном приложении можно использовать Markdown)
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
});