// Cost Management Module

// State
const costState = {
    kindergartens: [],
    classes: [],
    students: [],
    expenses: [],
    selectedStudent: null,
    currentPage: 1,
    pageSize: 10
};

// ============================================
// Cost Input Page Functions
// ============================================

async function initCostInput() {
    // Load kindergartens
    try {
        costState.kindergartens = await api.getKindergartens();
        populateKindergartenSelect();
        setupCostInputListeners();
        loadRecentEntries();
    } catch (error) {
        console.error('Failed to initialize cost input:', error);
    }
}

function populateKindergartenSelect() {
    const select = document.getElementById('kindergarten-select');
    if (!select) return;

    select.innerHTML = '<option value="">유치원을 선택하세요</option>';
    costState.kindergartens.forEach(kg => {
        const option = document.createElement('option');
        option.value = kg.id;
        option.textContent = kg.name;
        select.appendChild(option);
    });
}

function setupCostInputListeners() {
    // Kindergarten selection
    const kgSelect = document.getElementById('kindergarten-select');
    if (kgSelect) {
        kgSelect.addEventListener('change', async (e) => {
            const kgId = e.target.value;
            const classSelect = document.getElementById('class-select');
            const studentSelect = document.getElementById('student-select');

            // Reset downstream selects
            classSelect.innerHTML = '<option value="">반을 선택하세요</option>';
            classSelect.disabled = true;
            studentSelect.innerHTML = '<option value="">학생을 선택하세요</option>';
            studentSelect.disabled = true;
            hideStudentInfo();

            if (kgId) {
                costState.classes = await api.getClasses(kgId);
                populateClassSelect();
                classSelect.disabled = false;
            }
        });
    }

    // Class selection
    const classSelect = document.getElementById('class-select');
    if (classSelect) {
        classSelect.addEventListener('change', async (e) => {
            const classId = e.target.value;
            const studentSelect = document.getElementById('student-select');

            studentSelect.innerHTML = '<option value="">학생을 선택하세요</option>';
            studentSelect.disabled = true;
            hideStudentInfo();

            if (classId) {
                costState.students = await api.getStudents(classId);
                populateStudentSelect();
                studentSelect.disabled = false;
            }
        });
    }

    // Student selection
    const studentSelect = document.getElementById('student-select');
    if (studentSelect) {
        studentSelect.addEventListener('change', (e) => {
            const studentId = e.target.value;
            if (studentId) {
                const student = costState.students.find(s => s.id == studentId);
                if (student) {
                    costState.selectedStudent = student;
                    showStudentInfo(student);
                }
            } else {
                hideStudentInfo();
            }
        });
    }

    // Form submission
    const form = document.getElementById('cost-form');
    if (form) {
        form.addEventListener('submit', handleCostSubmit);
    }
}

function populateClassSelect() {
    const select = document.getElementById('class-select');
    if (!select) return;

    select.innerHTML = '<option value="">반을 선택하세요</option>';
    costState.classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        select.appendChild(option);
    });
}

function populateStudentSelect() {
    const select = document.getElementById('student-select');
    if (!select) return;

    select.innerHTML = '<option value="">학생을 선택하세요</option>';
    costState.students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.age}세)`;
        select.appendChild(option);
    });
}

function showStudentInfo(student) {
    const infoEl = document.getElementById('student-info');
    if (!infoEl) return;

    const initial = student.name.charAt(0);
    const classInfo = costState.classes.find(c => c.id == student.class_id);
    const className = classInfo ? classInfo.name : '';

    infoEl.innerHTML = `
        <div class="student-avatar">${initial}</div>
        <div class="student-details">
            <h4>${student.name}</h4>
            <p>${className} | ${student.age}세</p>
        </div>
    `;
    infoEl.classList.remove('hidden');
}

function hideStudentInfo() {
    const infoEl = document.getElementById('student-info');
    if (infoEl) {
        infoEl.classList.add('hidden');
    }
    costState.selectedStudent = null;
}

async function handleCostSubmit(e) {
    e.preventDefault();

    const studentId = document.getElementById('student-select').value;
    const category = document.getElementById('cost-category').value;
    const amount = document.getElementById('cost-amount').value;
    const description = document.getElementById('cost-description').value;

    if (!studentId || !category || !amount) {
        alert('필수 항목을 모두 입력해주세요.');
        return;
    }

    const data = {
        student_id: parseInt(studentId),
        category: category,
        amount: parseFloat(amount),
        description: description || `${category} 비용`
    };

    try {
        await api.createExpense(data);
        alert('비용이 저장되었습니다!');
        resetForm();
        loadRecentEntries();
    } catch (error) {
        console.error('Failed to save expense:', error);
        alert('비용 저장에 실패했습니다.');
    }
}

function resetForm() {
    const form = document.getElementById('cost-form');
    if (form) {
        form.reset();
    }

    // Reset selects
    const classSelect = document.getElementById('class-select');
    const studentSelect = document.getElementById('student-select');

    if (classSelect) {
        classSelect.innerHTML = '<option value="">반을 선택하세요</option>';
        classSelect.disabled = true;
    }

    if (studentSelect) {
        studentSelect.innerHTML = '<option value="">학생을 선택하세요</option>';
        studentSelect.disabled = true;
    }

    hideStudentInfo();
}

async function loadRecentEntries() {
    const listEl = document.getElementById('recent-list');
    if (!listEl) return;

    try {
        const expenses = await api.getExpenses();
        const students = await api.getStudents();
        const studentMap = {};
        students.forEach(s => studentMap[s.id] = s.name);

        const recent = expenses.slice(0, 5);

        if (recent.length === 0) {
            listEl.innerHTML = '<p class="empty-message">입력된 비용이 없습니다.</p>';
            return;
        }

        listEl.innerHTML = recent.map(expense => {
            const studentName = studentMap[expense.student_id] || '알 수 없음';
            const date = new Date(expense.date).toLocaleDateString('ko-KR');
            const amount = new Intl.NumberFormat('ko-KR').format(expense.amount);

            return `
                <div class="recent-item">
                    <div class="recent-item-info">
                        <span class="recent-item-title">${studentName} - ${expense.category}</span>
                        <span class="recent-item-meta">${date} | ${expense.description}</span>
                    </div>
                    <span class="recent-item-amount">${amount}원</span>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load recent entries:', error);
        listEl.innerHTML = '<p class="empty-message">데이터를 불러올 수 없습니다.</p>';
    }
}


// ============================================
// Cost Records Page Functions
// ============================================

async function initCostRecords() {
    try {
        costState.kindergartens = await api.getKindergartens();
        populateFilterKindergarten();
        setupRecordsListeners();
        await loadAllRecords();
    } catch (error) {
        console.error('Failed to initialize cost records:', error);
    }
}

function populateFilterKindergarten() {
    const select = document.getElementById('filter-kindergarten');
    if (!select) return;

    select.innerHTML = '<option value="">전체</option>';
    costState.kindergartens.forEach(kg => {
        const option = document.createElement('option');
        option.value = kg.id;
        option.textContent = kg.name;
        select.appendChild(option);
    });
}

function setupRecordsListeners() {
    // Kindergarten filter
    const kgFilter = document.getElementById('filter-kindergarten');
    if (kgFilter) {
        kgFilter.addEventListener('change', async (e) => {
            const kgId = e.target.value;
            const classFilter = document.getElementById('filter-class');
            const studentFilter = document.getElementById('filter-student');

            classFilter.innerHTML = '<option value="">전체</option>';
            studentFilter.innerHTML = '<option value="">전체</option>';

            if (kgId) {
                const classes = await api.getClasses(kgId);
                classes.forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls.id;
                    option.textContent = cls.name;
                    classFilter.appendChild(option);
                });
            }
        });
    }

    // Class filter
    const classFilter = document.getElementById('filter-class');
    if (classFilter) {
        classFilter.addEventListener('change', async (e) => {
            const classId = e.target.value;
            const studentFilter = document.getElementById('filter-student');

            studentFilter.innerHTML = '<option value="">전체</option>';

            if (classId) {
                const students = await api.getStudents(classId);
                students.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student.id;
                    option.textContent = student.name;
                    studentFilter.appendChild(option);
                });
            }
        });
    }
}

async function loadAllRecords() {
    const tbody = document.getElementById('records-tbody');
    if (!tbody) return;

    try {
        // Load all data
        const [expenses, students, classes, kindergartens] = await Promise.all([
            api.getExpenses(),
            api.getStudents(),
            api.getClasses(),
            api.getKindergartens()
        ]);

        // Create lookup maps
        const studentMap = {};
        students.forEach(s => studentMap[s.id] = s);

        const classMap = {};
        classes.forEach(c => classMap[c.id] = c);

        const kgMap = {};
        kindergartens.forEach(kg => kgMap[kg.id] = kg);

        costState.expenses = expenses;

        if (expenses.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="8">비용 내역이 없습니다.</td></tr>';
            updateSummary(0, 0);
            return;
        }

        // Update summary
        const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
        updateSummary(expenses.length, totalAmount);

        // Render table
        tbody.innerHTML = expenses.map(expense => {
            const student = studentMap[expense.student_id] || {};
            const classInfo = classMap[student.class_id] || {};
            const kgInfo = kgMap[classInfo.kindergarten_id] || {};

            const date = new Date(expense.date).toLocaleDateString('ko-KR');
            const amount = new Intl.NumberFormat('ko-KR').format(expense.amount);

            return `
                <tr data-id="${expense.id}">
                    <td>${date}</td>
                    <td>${kgInfo.name || '-'}</td>
                    <td>${classInfo.name || '-'}</td>
                    <td>${student.name || '-'}</td>
                    <td><span class="category-badge">${expense.category}</span></td>
                    <td class="amount">${amount}원</td>
                    <td>${expense.description || '-'}</td>
                    <td>
                        <button class="action-btn delete-btn" onclick="deleteExpense(${expense.id})">삭제</button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Failed to load records:', error);
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8">데이터를 불러올 수 없습니다.</td></tr>';
    }
}

function updateSummary(count, amount) {
    const countEl = document.getElementById('total-count');
    const amountEl = document.getElementById('total-amount');

    if (countEl) {
        countEl.textContent = `${count}건`;
    }

    if (amountEl) {
        amountEl.textContent = new Intl.NumberFormat('ko-KR').format(amount) + '원';
    }
}

async function applyFilters() {
    const studentId = document.getElementById('filter-student').value;
    const category = document.getElementById('filter-category').value;

    const tbody = document.getElementById('records-tbody');
    if (!tbody) return;

    try {
        let expenses = await api.getExpenses(studentId || null);

        // Apply category filter
        if (category) {
            expenses = expenses.filter(e => e.category === category);
        }

        // Load lookup data
        const [students, classes, kindergartens] = await Promise.all([
            api.getStudents(),
            api.getClasses(),
            api.getKindergartens()
        ]);

        const studentMap = {};
        students.forEach(s => studentMap[s.id] = s);

        const classMap = {};
        classes.forEach(c => classMap[c.id] = c);

        const kgMap = {};
        kindergartens.forEach(kg => kgMap[kg.id] = kg);

        if (expenses.length === 0) {
            tbody.innerHTML = '<tr class="empty-row"><td colspan="8">조건에 맞는 내역이 없습니다.</td></tr>';
            updateSummary(0, 0);
            return;
        }

        // Update summary
        const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
        updateSummary(expenses.length, totalAmount);

        // Render table
        tbody.innerHTML = expenses.map(expense => {
            const student = studentMap[expense.student_id] || {};
            const classInfo = classMap[student.class_id] || {};
            const kgInfo = kgMap[classInfo.kindergarten_id] || {};

            const date = new Date(expense.date).toLocaleDateString('ko-KR');
            const amount = new Intl.NumberFormat('ko-KR').format(expense.amount);

            return `
                <tr data-id="${expense.id}">
                    <td>${date}</td>
                    <td>${kgInfo.name || '-'}</td>
                    <td>${classInfo.name || '-'}</td>
                    <td>${student.name || '-'}</td>
                    <td><span class="category-badge">${expense.category}</span></td>
                    <td class="amount">${amount}원</td>
                    <td>${expense.description || '-'}</td>
                    <td>
                        <button class="action-btn delete-btn" onclick="deleteExpense(${expense.id})">삭제</button>
                    </td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Failed to apply filters:', error);
    }
}

function resetFilters() {
    document.getElementById('filter-kindergarten').value = '';
    document.getElementById('filter-class').innerHTML = '<option value="">전체</option>';
    document.getElementById('filter-student').innerHTML = '<option value="">전체</option>';
    document.getElementById('filter-category').value = '';

    loadAllRecords();
}

async function deleteExpense(expenseId) {
    if (!confirm('이 비용을 삭제하시겠습니까?')) return;

    try {
        await api.deleteExpense(expenseId);
        alert('삭제되었습니다.');
        loadAllRecords();
    } catch (error) {
        console.error('Failed to delete expense:', error);
        alert('삭제에 실패했습니다.');
    }
}
