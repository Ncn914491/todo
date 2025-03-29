document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    
    // Load tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Render initial tasks
    renderTasks();
    
    // Add task event
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    // Function to add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const task = {
                id: Date.now(),
                text: taskText,
                completed: false
            };
            
            tasks.push(task);
            saveTasks();
            renderTask(task);
            taskInput.value = '';
            taskInput.focus();
        }
    }
    
    // Function to render all tasks
    function renderTasks() {
        taskList.innerHTML = '';
        
        if (tasks.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-list';
            emptyMessage.textContent = 'No tasks yet. Add a task to get started!';
            taskList.appendChild(emptyMessage);
            return;
        }
        
        tasks.forEach(task => {
            renderTask(task);
        });
    }
    
    // Function to render a single task
    function renderTask(task) {
        // Remove empty message if it exists
        const emptyMessage = taskList.querySelector('.empty-list');
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;
        
        const taskText = document.createElement('span');
        taskText.className = 'task-text';
        taskText.textContent = task.text;
        if (task.completed) {
            taskText.classList.add('completed');
        }
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        
        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
        completeBtn.addEventListener('click', () => toggleComplete(task.id));
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editTask(task.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        actionsDiv.appendChild(completeBtn);
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        li.appendChild(taskText);
        li.appendChild(actionsDiv);
        
        taskList.appendChild(li);
    }
    
    // Function to toggle task completion
    function toggleComplete(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            
            const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
            const taskText = taskItem.querySelector('.task-text');
            const completeBtn = taskItem.querySelector('.complete-btn');
            
            if (tasks[taskIndex].completed) {
                taskText.classList.add('completed');
                completeBtn.textContent = 'Undo';
            } else {
                taskText.classList.remove('completed');
                completeBtn.textContent = 'Complete';
            }
        }
    }
    
    // Function to edit a task with inline editing
    function editTask(id) {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
            const taskText = taskItem.querySelector('.task-text');
            
            // Create an input element
            const input = document.createElement('input');
            input.type = 'text';
            input.value = tasks[taskIndex].text;
            input.className = 'edit-input';
            
            // Replace span with input
            taskText.replaceWith(input);
            input.focus();
            
            // Handle saving on blur or Enter
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    saveEdit();
                }
            });
            
            input.addEventListener('blur', saveEdit);
            
            function saveEdit() {
                const newText = input.value.trim();
                if (newText !== '') {
                    tasks[taskIndex].text = newText;
                    saveTasks();
                    
                    // Create new span and replace input
                    const newTaskText = document.createElement('span');
                    newTaskText.className = 'task-text';
                    if (tasks[taskIndex].completed) {
                        newTaskText.classList.add('completed');
                    }
                    newTaskText.textContent = newText;
                    input.replaceWith(newTaskText);
                } else {
                    // If empty, revert to original text
                    const newTaskText = document.createElement('span');
                    newTaskText.className = 'task-text';
                    if (tasks[taskIndex].completed) {
                        newTaskText.classList.add('completed');
                    }
                    newTaskText.textContent = tasks[taskIndex].text;
                    input.replaceWith(newTaskText);
                }
            }
        }
    }
    
    // Function to delete a task with improved handling
    function deleteTask(id) {
        const taskItem = document.querySelector(`.task-item[data-id="${id}"]`);
        
        // Prevent multiple deletion clicks
        if (taskItem.classList.contains('delete-animation')) {
            return;
        }
        
        // Add delete animation
        taskItem.classList.add('delete-animation');
        
        // Wait for animation to complete before removing
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }, 300);
    }
    
    // Function to save tasks to localStorage with error handling
    function saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (e) {
            console.error('Could not save to localStorage:', e);
            alert('Could not save your tasks. Your storage might be full.');
        }
    }
});