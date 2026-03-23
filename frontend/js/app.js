// State
const state = {
    currentUser: null,
    currentPost: null,
    editingPost: null,
    classes: [],
    students: []
};

// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-links a');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Check if on expenses page without login
    if (!auth.isLoggedIn()) {
        // Allow viewing home and board without login
    } else {
        state.currentUser = auth.getUser();
        const freshUser = await auth.fetchCurrentUser();
        if (freshUser) {
            state.currentUser = freshUser;
        }
    }

    auth.updateNavbar();
    setupEventListeners();
    showPage('home');
});

function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.dataset.page;
            showPage(page);
        });
    });

    // Board events
    document.getElementById('new-post-btn').addEventListener('click', () => {
        if (!state.currentUser) {
            alert('로그인이 필요합니다.');
            window.location.href = 'login.html';
            return;
        }
        state.editingPost = null;
        document.getElementById('write-page-title').textContent = '새 글 쓰기';
        document.getElementById('post-form').reset();
        showPage('write-post');
    });

    document.querySelectorAll('.category-tabs .tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.category-tabs .tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            loadPosts(e.target.dataset.category);
        });
    });

    // Post form
    document.getElementById('post-form').addEventListener('submit', handlePostSubmit);
    document.getElementById('cancel-post').addEventListener('click', () => showPage('board'));

    // Post detail
    document.getElementById('back-to-board').addEventListener('click', () => showPage('board'));
    document.getElementById('submit-comment').addEventListener('click', handleCommentSubmit);

    // Expense tabs
    document.querySelectorAll('.expenses-tabs .tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.expenses-tabs .tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            const tabName = e.target.dataset.tab;
            document.querySelectorAll('.expense-tab').forEach(t => t.classList.remove('active'));
            const tabId = tabName === 'input' ? 'expense-input-tab' : `${tabName}-tab`;
            const tabEl = document.getElementById(tabId);
            if (tabEl) {
                tabEl.classList.add('active');
            }
        });
    });

    // Expense class change -> load students
    document.getElementById('expense-class').addEventListener('change', async (e) => {
        const classId = e.target.value;
        const studentSelect = document.getElementById('expense-student');
        studentSelect.innerHTML = '<option value="">선택하세요</option>';
        if (classId) {
            const students = await api.getStudents(classId);
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.name} (${student.age}세)`;
                studentSelect.appendChild(option);
            });
        }
    });

    // Student summary: class change -> load students
    document.getElementById('student-summary-class').addEventListener('change', async (e) => {
        const classId = e.target.value;
        const studentSelect = document.getElementById('student-summary-student');
        studentSelect.innerHTML = '<option value="">학생 선택</option>';
        if (classId) {
            const students = await api.getStudents(classId);
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.id;
                option.textContent = `${student.name} (${student.age}세)`;
                studentSelect.appendChild(option);
            });
        }
    });

    document.getElementById('load-student-summary').addEventListener('click', loadStudentSummary);
    document.getElementById('load-class-summary').addEventListener('click', loadClassSummary);
    document.getElementById('load-kg-summary').addEventListener('click', loadKindergartenSummary);

    // Excel download buttons
    document.getElementById('download-expenses-excel').addEventListener('click', downloadExpensesExcel);
    document.getElementById('download-categories-excel').addEventListener('click', downloadCategoriesExcel);
    document.getElementById('download-student-summary-excel').addEventListener('click', downloadStudentSummaryExcel);
    document.getElementById('download-class-summary-excel').addEventListener('click', downloadClassSummaryExcel);
    document.getElementById('download-kg-summary-excel').addEventListener('click', downloadKindergartenSummaryExcel);

    // Expense form
    document.getElementById('expense-form').addEventListener('submit', handleExpenseSubmit);

    // Category management
    document.getElementById('add-category-form').addEventListener('submit', handleAddCategory);
    document.getElementById('filter-kg-for-category').addEventListener('change', loadCategoryList);

    // Management tabs
    document.querySelectorAll('.management-tabs .tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.management-tabs .tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            const tabName = e.target.dataset.tab;
            document.querySelectorAll('.management-tab').forEach(t => {
                t.classList.remove('active');
                t.style.display = 'none';
            });
            const tabEl = document.getElementById(`${tabName}-tab`);
            if (tabEl) {
                tabEl.classList.add('active');
                tabEl.style.display = 'block';
            }
        });
    });

    // Kindergarten form
    document.getElementById('add-kindergarten-form').addEventListener('submit', handleAddKindergarten);

    // Class form
    document.getElementById('add-class-form').addEventListener('submit', handleAddClass);
    document.getElementById('class-kindergarten').addEventListener('change', loadClassesForKindergarten);
    document.getElementById('filter-kg-for-class').addEventListener('change', filterClasses);

    // Student form
    document.getElementById('add-student-form').addEventListener('submit', handleAddStudent);
    document.getElementById('student-kindergarten').addEventListener('change', loadClassesForStudent);
    document.getElementById('filter-kg-for-student').addEventListener('change', filterStudentsByKg);
    document.getElementById('filter-class-for-student').addEventListener('change', filterStudentsByClass);

    // Excel upload
    document.getElementById('upload-excel-btn').addEventListener('click', () => {
        document.getElementById('excel-upload-modal').style.display = 'flex';
    });
    document.querySelector('.modal-close').addEventListener('click', closeExcelModal);
    document.getElementById('cancel-upload').addEventListener('click', closeExcelModal);
    document.getElementById('excel-upload-form').addEventListener('submit', handleExcelUpload);
    document.getElementById('download-template').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = api.getTemplateDownloadUrl();
    });

    // AI Assistant tabs
    document.querySelectorAll('.ai-tabs .tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.ai-tabs .tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            const tabName = e.target.dataset.tab;
            document.querySelectorAll('.ai-tab').forEach(t => t.classList.remove('active'));
            const tabEl = document.getElementById(`ai-${tabName}-tab`);
            if (tabEl) {
                tabEl.classList.add('active');
            }
        });
    });

    // AI form handlers
    document.getElementById('observation-form').addEventListener('submit', handleObservationSubmit);
    document.getElementById('assessment-form').addEventListener('submit', handleAssessmentSubmit);
    document.getElementById('consultation-form').addEventListener('submit', handleConsultationSubmit);

    // AI copy buttons
    document.getElementById('copy-observation').addEventListener('click', () => copyToClipboard('observation'));
    document.getElementById('copy-assessment').addEventListener('click', () => copyToClipboard('assessment'));
    document.getElementById('copy-consultation').addEventListener('click', () => copyToClipboard('consultation'));
}

function showPage(pageName) {
    pages.forEach(p => p.classList.remove('active'));
    navLinks.forEach(l => l.classList.remove('active'));

    const pageEl = document.getElementById(`${pageName}-page`);
    if (pageEl) {
        pageEl.classList.add('active');
    }

    const navEl = document.querySelector(`[data-page="${pageName}"]`);
    if (navEl) {
        navEl.classList.add('active');
    }

    // Load page-specific data
    switch (pageName) {
        case 'home':
            loadHomeStats();
            break;
        case 'board':
            loadPosts();
            break;
        case 'expenses':
            if (!state.currentUser) {
                alert('로그인이 필요합니다.');
                window.location.href = 'login.html';
                return;
            }
            loadExpenses();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'management':
            loadManagement();
            break;
        case 'ai-assistant':
            if (!state.currentUser) {
                alert('로그인이 필요합니다.');
                window.location.href = 'login.html';
                return;
            }
            loadAIAssistant();
            break;
    }
}

async function loadHomeStats() {
    try {
        // Load all data in parallel (use all=true to get total counts)
        const [posts, users, kindergartens] = await Promise.all([
            api.getPosts(),
            api.getUsers(true),  // all=true to get all users for stats
            api.getKindergartens()
        ]);

        // Display total counts
        document.getElementById('total-posts').textContent = posts.length;
        document.getElementById('total-users').textContent = users.length;
        document.getElementById('total-kindergartens').textContent = kindergartens.length;

        // Recent posts
        const recentPosts = posts.slice(0, 5);
        document.getElementById('recent-posts-list').innerHTML =
            recentPosts.map(p => components.postCard(p)).join('');

        // Add click handlers
        document.querySelectorAll('#recent-posts-list .post-card').forEach(card => {
            card.addEventListener('click', () => openPost(parseInt(card.dataset.id)));
        });
    } catch (error) {
        console.error('Failed to load home stats:', error);
    }
}

async function loadPosts(category = '') {
    const listEl = document.getElementById('posts-list');
    listEl.innerHTML = components.loading();

    try {
        const posts = await api.getPosts(category || null);
        listEl.innerHTML = posts.map(p => components.postCard(p)).join('') || '<p>게시글이 없습니다.</p>';

        // Add click handlers
        document.querySelectorAll('#posts-list .post-card').forEach(card => {
            card.addEventListener('click', () => openPost(parseInt(card.dataset.id)));
        });
    } catch (error) {
        listEl.innerHTML = components.alert('게시글을 불러오는데 실패했습니다.', 'error');
    }
}

async function openPost(postId) {
    try {
        const post = await api.getPost(postId);
        state.currentPost = post;

        const isAuthor = state.currentUser && post.author_id === state.currentUser.id;
        document.getElementById('post-detail').innerHTML = components.postDetail(post, isAuthor);

        // Load comments
        const comments = await api.getComments(postId);
        const currentUserId = state.currentUser?.id;
        document.getElementById('comments-list').innerHTML =
            comments.map(c => components.comment(c, currentUserId)).join('') || '<p>댓글이 없습니다.</p>';

        // Add event listeners
        if (isAuthor) {
            document.getElementById('edit-post-btn')?.addEventListener('click', () => editPost(post));
            document.getElementById('delete-post-btn')?.addEventListener('click', () => deletePost(post.id));
        }

        document.querySelectorAll('.delete-comment').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const commentEl = e.target.closest('.comment');
                deleteComment(parseInt(commentEl.dataset.id));
            });
        });

        showPage('post-detail');
    } catch (error) {
        alert('게시글을 불러오는데 실패했습니다.');
    }
}

function editPost(post) {
    state.editingPost = post;
    document.getElementById('write-page-title').textContent = '글 수정';
    document.getElementById('post-category').value = post.category;
    document.getElementById('post-title').value = post.title;
    document.getElementById('post-content').value = post.content;
    showPage('write-post');
}

async function handlePostSubmit(e) {
    e.preventDefault();

    if (!state.currentUser) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    const data = {
        title: document.getElementById('post-title').value,
        content: document.getElementById('post-content').value,
        category: document.getElementById('post-category').value,
        author_id: state.currentUser.id
    };

    try {
        if (state.editingPost) {
            await api.updatePost(state.editingPost.id, data);
            alert('글이 수정되었습니다.');
        } else {
            await api.createPost(data);
            alert('글이 작성되었습니다.');
        }
        showPage('board');
    } catch (error) {
        alert('저장에 실패했습니다.');
    }
}

async function deletePost(postId) {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
        await api.deletePost(postId);
        alert('삭제되었습니다.');
        showPage('board');
    } catch (error) {
        alert('삭제에 실패했습니다.');
    }
}

async function handleCommentSubmit() {
    if (!state.currentUser) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    const content = document.getElementById('comment-content').value.trim();
    if (!content) {
        alert('댓글 내용을 입력해주세요.');
        return;
    }

    try {
        await api.createComment({
            content,
            post_id: state.currentPost.id,
            author_id: state.currentUser.id
        });
        document.getElementById('comment-content').value = '';
        openPost(state.currentPost.id);
    } catch (error) {
        alert('댓글 작성에 실패했습니다.');
    }
}

async function deleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
        await api.deleteComment(commentId);
        openPost(state.currentPost.id);
    } catch (error) {
        alert('삭제에 실패했습니다.');
    }
}

async function loadExpenses() {
    // Show user's kindergarten info
    const infoEl = document.getElementById('my-kindergarten-info');
    if (state.currentUser && state.currentUser.kindergarten_name) {
        infoEl.textContent = `소속 유치원: ${state.currentUser.kindergarten_name}`;
    } else {
        infoEl.textContent = '유치원 정보가 없습니다. 프로필을 확인해주세요.';
    }

    // Load classes for user's kindergarten
    await loadMyClasses();

    // Load expense categories
    await loadExpenseCategories();

    // Load kindergartens for category management
    await loadKindergartensForCategory();

    try {
        const expenses = await api.getExpenses();
        const students = await api.getStudents();
        const studentMap = {};
        students.forEach(s => studentMap[s.id] = s.name);

        const listEl = document.getElementById('expense-list');
        listEl.innerHTML = expenses.slice(0, 20).map(e =>
            components.expenseItem(e, studentMap[e.student_id] || '알 수 없음')
        ).join('') || '<p>비용 내역이 없습니다.</p>';

        document.querySelectorAll('.delete-expense').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const itemEl = e.target.closest('.expense-item');
                if (confirm('삭제하시겠습니까?')) {
                    await api.deleteExpense(parseInt(itemEl.dataset.id));
                    loadExpenses();
                }
            });
        });
    } catch (error) {
        console.error('Failed to load expenses:', error);
    }
}

async function loadMyClasses() {
    try {
        const classes = await api.getClasses();
        state.classes = classes;

        // Populate all class selects
        const classSelects = ['expense-class', 'summary-class', 'student-summary-class'];
        classSelects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                select.innerHTML = '<option value="">반 선택</option>';
                classes.forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls.id;
                    option.textContent = cls.name;
                    select.appendChild(option);
                });
            }
        });
    } catch (error) {
        console.error('Failed to load classes:', error);
    }
}

async function handleExpenseSubmit(e) {
    e.preventDefault();

    if (!state.currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }

    const data = {
        student_id: parseInt(document.getElementById('expense-student').value),
        category: document.getElementById('expense-category').value,
        amount: parseFloat(document.getElementById('expense-amount').value),
        description: document.getElementById('expense-description').value
    };

    if (!data.student_id) {
        alert('학생을 선택해주세요.');
        return;
    }

    try {
        await api.createExpense(data);
        alert('비용이 추가되었습니다.');
        document.getElementById('expense-form').reset();
        loadExpenses();
    } catch (error) {
        if (error.message && error.message.includes('Access denied')) {
            alert('접근 권한이 없습니다. 해당 학생은 다른 유치원 소속입니다.');
        } else {
            alert('비용 추가에 실패했습니다.');
        }
    }
}

async function loadClassSummary() {
    const classId = document.getElementById('summary-class').value;
    if (!classId) {
        alert('반을 선택해주세요.');
        return;
    }

    try {
        const summary = await api.getClassSummary(classId);
        document.getElementById('class-summary-result').innerHTML = components.summaryCard(summary, 'class');
    } catch (error) {
        alert('집계 조회에 실패했습니다.');
    }
}

async function loadKindergartenSummary() {
    if (!state.currentUser || !state.currentUser.kindergarten_name) {
        alert('유치원 정보가 없습니다. 프로필에서 유치원을 설정해주세요.');
        return;
    }

    try {
        // 유치원 이름으로 ID 찾기
        const kindergartens = await api.getKindergartens();
        const myKindergarten = kindergartens.find(kg => kg.name === state.currentUser.kindergarten_name);

        if (!myKindergarten) {
            alert('등록된 유치원을 찾을 수 없습니다. 학생관리에서 유치원을 먼저 등록해주세요.');
            return;
        }

        const summary = await api.getKindergartenSummary(myKindergarten.id);
        document.getElementById('kg-summary-result').innerHTML = components.summaryCard(summary, 'kindergarten');
    } catch (error) {
        console.error('Kindergarten summary error:', error);
        alert('집계 조회에 실패했습니다.');
    }
}

async function loadStudentSummary() {
    const studentId = document.getElementById('student-summary-student').value;
    if (!studentId) {
        alert('학생을 선택해주세요.');
        return;
    }

    try {
        const summary = await api.getStudentSummary(studentId);
        document.getElementById('student-summary-result').innerHTML = components.summaryCard(summary, 'student');
    } catch (error) {
        alert('집계 조회에 실패했습니다.');
    }
}

function loadProfile(editMode = false) {
    const contentEl = document.getElementById('profile-content');
    if (!state.currentUser) {
        contentEl.innerHTML = `
            <p>로그인이 필요합니다.</p>
            <a href="login.html" class="btn btn-primary">로그인하기</a>
        `;
        return;
    }
    contentEl.innerHTML = components.profileCard(state.currentUser, editMode);

    if (editMode) {
        // Load kindergartens and classes for selection
        loadProfileSelects();

        // Cancel button
        document.getElementById('cancel-profile-edit').addEventListener('click', () => {
            loadProfile(false);
        });

        // Form submit
        document.getElementById('profile-edit-form').addEventListener('submit', handleProfileSave);

        // Kindergarten change -> load classes
        document.getElementById('edit-kindergarten').addEventListener('change', async (e) => {
            const kgId = e.target.value;
            const kgSelect = e.target;
            const kgNameInput = document.getElementById('edit-kindergarten-name');
            const classSelect = document.getElementById('edit-class');
            const classNameInput = document.getElementById('edit-class-name');

            if (kgId) {
                // 선택한 유치원명 자동 입력
                const selectedOption = kgSelect.options[kgSelect.selectedIndex];
                kgNameInput.value = selectedOption.textContent;

                // 해당 유치원의 반 목록 로드
                classSelect.innerHTML = '<option value="">직접 입력</option>';
                try {
                    const classes = await api.getClasses(kgId);
                    classes.forEach(cls => {
                        const option = document.createElement('option');
                        option.value = cls.id;
                        option.textContent = cls.name;
                        classSelect.appendChild(option);
                    });
                } catch (error) {
                    console.error('Failed to load classes:', error);
                }
            } else {
                classSelect.innerHTML = '<option value="">직접 입력</option>';
            }
        });

        // Class change -> auto fill class name
        document.getElementById('edit-class').addEventListener('change', (e) => {
            const classSelect = e.target;
            const classNameInput = document.getElementById('edit-class-name');
            if (classSelect.value) {
                const selectedOption = classSelect.options[classSelect.selectedIndex];
                classNameInput.value = selectedOption.textContent;
            }
        });
    } else {
        // Add edit button handler
        document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
            loadProfile(true);
        });
    }
}

async function loadProfileSelects() {
    try {
        const kindergartens = await api.getKindergartens();
        const kgSelect = document.getElementById('edit-kindergarten');

        kindergartens.forEach(kg => {
            const option = document.createElement('option');
            option.value = kg.id;
            option.textContent = kg.name;
            kgSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load kindergartens for profile:', error);
    }
}

async function handleProfileSave(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById('edit-name').value.trim(),
        region: document.getElementById('edit-region').value.trim(),
        kindergarten_name: document.getElementById('edit-kindergarten-name').value.trim(),
        class_name: document.getElementById('edit-class-name').value.trim()
    };

    if (!data.name) {
        alert('이름을 입력해주세요.');
        return;
    }

    try {
        const result = await api.updateUser(state.currentUser.id, data);
        if (result.id) {
            // 성공 - API 응답으로 상태 업데이트
            state.currentUser = result;
            auth.setUser(state.currentUser);
            alert('프로필이 저장되었습니다.');
            loadProfile(false);
            auth.updateNavbar();
        } else if (result.detail) {
            alert(result.detail);
        }
    } catch (error) {
        console.error('Profile save error:', error);
        alert('프로필 저장에 실패했습니다.');
    }
}

// ==================== Management Functions ====================

async function loadManagement() {
    await Promise.all([
        loadKindergartensTab(),
        loadKindergartenSelects()
    ]);
}

async function loadKindergartenSelects() {
    try {
        const kindergartens = await api.getKindergartens();
        const selects = ['class-kindergarten', 'filter-kg-for-class', 'student-kindergarten', 'filter-kg-for-student'];

        selects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                const firstOption = select.options[0].outerHTML;
                select.innerHTML = firstOption;
                kindergartens.forEach(kg => {
                    const option = document.createElement('option');
                    option.value = kg.id;
                    option.textContent = kg.name;
                    select.appendChild(option);
                });
            }
        });
    } catch (error) {
        console.error('Failed to load kindergartens for selects:', error);
    }
}

async function loadKindergartensTab() {
    const listEl = document.getElementById('kindergartens-list');
    listEl.innerHTML = components.loading();

    try {
        const kindergartens = await api.getKindergartens();
        if (kindergartens.length === 0) {
            listEl.innerHTML = '<p>등록된 유치원이 없습니다.</p>';
            return;
        }

        listEl.innerHTML = kindergartens.map(kg => `
            <div class="data-item" data-id="${kg.id}">
                <div class="data-item-info">
                    <span class="name">${kg.name}</span>
                    <span class="details">${kg.region || ''} ${kg.address || ''}</span>
                </div>
                <div class="data-item-actions">
                    <button class="btn btn-danger btn-small delete-kg">삭제</button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.delete-kg').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const item = e.target.closest('.data-item');
                const id = parseInt(item.dataset.id);
                if (confirm('유치원을 삭제하시겠습니까? 연결된 반과 학생도 함께 삭제됩니다.')) {
                    await deleteKindergarten(id);
                }
            });
        });
    } catch (error) {
        listEl.innerHTML = components.alert('유치원 목록을 불러오는데 실패했습니다.', 'error');
    }
}

async function loadClassesTab() {
    const listEl = document.getElementById('classes-list');
    listEl.innerHTML = components.loading();

    try {
        const filterKgId = document.getElementById('filter-kg-for-class').value;
        const classes = await api.getClasses(filterKgId || null);
        const kindergartens = await api.getKindergartens();
        const kgMap = {};
        kindergartens.forEach(kg => kgMap[kg.id] = kg.name);

        if (classes.length === 0) {
            listEl.innerHTML = '<p>등록된 반이 없습니다.</p>';
            return;
        }

        listEl.innerHTML = classes.map(cls => `
            <div class="data-item" data-id="${cls.id}">
                <div class="data-item-info">
                    <span class="name">${cls.name}</span>
                    <span class="details">유치원: ${kgMap[cls.kindergarten_id] || '알 수 없음'}</span>
                </div>
                <div class="data-item-actions">
                    <button class="btn btn-danger btn-small delete-class">삭제</button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.delete-class').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const item = e.target.closest('.data-item');
                const id = parseInt(item.dataset.id);
                if (confirm('반을 삭제하시겠습니까? 연결된 학생도 함께 삭제됩니다.')) {
                    await deleteClass(id);
                }
            });
        });
    } catch (error) {
        listEl.innerHTML = components.alert('반 목록을 불러오는데 실패했습니다.', 'error');
    }
}

async function loadStudentsTab() {
    const listEl = document.getElementById('students-list');
    listEl.innerHTML = components.loading();

    try {
        const filterClassId = document.getElementById('filter-class-for-student').value;
        const students = await api.getStudents(filterClassId || null);
        const classes = await api.getClasses();
        const classMap = {};
        classes.forEach(cls => classMap[cls.id] = cls.name);

        if (students.length === 0) {
            listEl.innerHTML = '<p>등록된 학생이 없습니다.</p>';
            return;
        }

        listEl.innerHTML = students.map(student => `
            <div class="data-item" data-id="${student.id}">
                <div class="data-item-info">
                    <span class="name">${student.name} (${student.age}세)</span>
                    <span class="details">반: ${classMap[student.class_id] || '알 수 없음'}</span>
                </div>
                <div class="data-item-actions">
                    <button class="btn btn-danger btn-small delete-student">삭제</button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.delete-student').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const item = e.target.closest('.data-item');
                const id = parseInt(item.dataset.id);
                if (confirm('학생을 삭제하시겠습니까?')) {
                    await deleteStudentItem(id);
                }
            });
        });
    } catch (error) {
        listEl.innerHTML = components.alert('학생 목록을 불러오는데 실패했습니다.', 'error');
    }
}

async function handleAddKindergarten(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById('kg-name').value.trim(),
        region: document.getElementById('kg-region').value.trim(),
        address: document.getElementById('kg-address').value.trim()
    };

    if (!data.name) {
        alert('유치원명을 입력해주세요.');
        return;
    }

    try {
        await api.createKindergarten(data);
        alert('유치원이 등록되었습니다.');
        document.getElementById('add-kindergarten-form').reset();
        await loadKindergartensTab();
        await loadKindergartenSelects();
    } catch (error) {
        alert('유치원 등록에 실패했습니다.');
    }
}

async function handleAddClass(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById('class-name').value.trim(),
        kindergarten_id: parseInt(document.getElementById('class-kindergarten').value)
    };

    if (!data.name || !data.kindergarten_id) {
        alert('유치원과 반 이름을 입력해주세요.');
        return;
    }

    try {
        await api.createClass(data);
        alert('반이 등록되었습니다.');
        document.getElementById('add-class-form').reset();
        await loadClassesTab();
    } catch (error) {
        alert('반 등록에 실패했습니다.');
    }
}

async function handleAddStudent(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById('student-name').value.trim(),
        age: parseInt(document.getElementById('student-age').value) || 5,
        class_id: parseInt(document.getElementById('student-class').value)
    };

    if (!data.name || !data.class_id) {
        alert('반과 학생 이름을 입력해주세요.');
        return;
    }

    try {
        await api.createStudent(data);
        alert('학생이 등록되었습니다.');
        document.getElementById('add-student-form').reset();
        await loadStudentsTab();
    } catch (error) {
        alert('학생 등록에 실패했습니다.');
    }
}

async function deleteKindergarten(id) {
    try {
        await api.deleteKindergarten(id);
        alert('유치원이 삭제되었습니다.');
        await loadKindergartensTab();
        await loadKindergartenSelects();
    } catch (error) {
        alert('유치원 삭제에 실패했습니다.');
    }
}

async function deleteClass(id) {
    try {
        await api.deleteClass(id);
        alert('반이 삭제되었습니다.');
        await loadClassesTab();
    } catch (error) {
        alert('반 삭제에 실패했습니다.');
    }
}

async function deleteStudentItem(id) {
    try {
        await api.deleteStudent(id);
        alert('학생이 삭제되었습니다.');
        await loadStudentsTab();
    } catch (error) {
        alert('학생 삭제에 실패했습니다.');
    }
}

async function loadClassesForKindergarten() {
    // When kindergarten changes in class registration form, reload classes list
    await loadClassesTab();
}

async function loadClassesForStudent() {
    const kgId = document.getElementById('student-kindergarten').value;
    const classSelect = document.getElementById('student-class');
    classSelect.innerHTML = '<option value="">반 선택</option>';

    if (kgId) {
        try {
            const classes = await api.getClasses(kgId);
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = cls.name;
                classSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load classes:', error);
        }
    }
}

async function filterClasses() {
    await loadClassesTab();
}

async function filterStudentsByKg() {
    const kgId = document.getElementById('filter-kg-for-student').value;
    const classFilter = document.getElementById('filter-class-for-student');
    classFilter.innerHTML = '<option value="">전체 반</option>';

    if (kgId) {
        try {
            const classes = await api.getClasses(kgId);
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = cls.name;
                classFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to load classes:', error);
        }
    }
    await loadStudentsTab();
}

async function filterStudentsByClass() {
    await loadStudentsTab();
}

function closeExcelModal() {
    document.getElementById('excel-upload-modal').style.display = 'none';
    document.getElementById('excel-upload-form').reset();
    document.getElementById('upload-result').style.display = 'none';
}

async function handleExcelUpload(e) {
    e.preventDefault();

    const fileInput = document.getElementById('excel-file');
    const file = fileInput.files[0];

    if (!file) {
        alert('파일을 선택해주세요.');
        return;
    }

    const resultEl = document.getElementById('upload-result');
    resultEl.style.display = 'block';
    resultEl.className = '';
    resultEl.textContent = '업로드 중...';

    try {
        const result = await api.uploadExcel(file);

        if (result.errors && result.errors.length > 0) {
            resultEl.className = 'error';
            resultEl.innerHTML = `
                <p>일부 오류가 발생했습니다:</p>
                <ul>${result.errors.map(e => `<li>${e}</li>`).join('')}</ul>
                <p>유치원 ${result.created_kindergartens}개, 반 ${result.created_classes}개, 학생 ${result.created_students}명이 등록되었습니다.</p>
            `;
        } else {
            resultEl.className = 'success';
            resultEl.innerHTML = `
                <p>업로드 완료!</p>
                <p>유치원 ${result.created_kindergartens}개, 반 ${result.created_classes}개, 학생 ${result.created_students}명이 등록되었습니다.</p>
            `;
        }

        // Reload data
        await loadManagement();
    } catch (error) {
        resultEl.className = 'error';
        resultEl.textContent = '업로드에 실패했습니다: ' + (error.detail || error.message || '알 수 없는 오류');
    }
}

// ==================== Expense Category Functions ====================

// 기본 카테고리 목록
const DEFAULT_CATEGORIES = ['교재비', '급식비', '현장학습비', '특별활동비', '준비물비'];

async function loadExpenseCategories() {
    const select = document.getElementById('expense-category');
    select.innerHTML = '<option value="">선택하세요</option>';

    try {
        // 먼저 사용자 정의 카테고리 로드
        const categories = await api.getExpenseCategories();

        // 기본 카테고리 추가
        DEFAULT_CATEGORIES.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });

        // 사용자 정의 카테고리 추가 (중복 제거)
        const addedNames = new Set(DEFAULT_CATEGORIES);
        categories.forEach(cat => {
            if (!addedNames.has(cat.name)) {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = `${cat.name} (사용자 정의)`;
                select.appendChild(option);
                addedNames.add(cat.name);
            }
        });
    } catch (error) {
        // 오류 시 기본 카테고리만 표시
        DEFAULT_CATEGORIES.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
    }
}

async function loadKindergartensForCategory() {
    try {
        const kindergartens = await api.getKindergartens();
        const selects = ['category-kindergarten', 'filter-kg-for-category'];

        selects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                const firstOption = select.options[0].outerHTML;
                select.innerHTML = firstOption;
                kindergartens.forEach(kg => {
                    const option = document.createElement('option');
                    option.value = kg.id;
                    option.textContent = kg.name;
                    select.appendChild(option);
                });
            }
        });
    } catch (error) {
        console.error('Failed to load kindergartens for category:', error);
    }
}

async function loadCategoryList() {
    const listEl = document.getElementById('category-list');
    listEl.innerHTML = components.loading();

    try {
        const filterKgId = document.getElementById('filter-kg-for-category').value;
        const categories = await api.getExpenseCategories(filterKgId || null);
        const kindergartens = await api.getKindergartens();
        const kgMap = {};
        kindergartens.forEach(kg => kgMap[kg.id] = kg.name);

        if (categories.length === 0) {
            listEl.innerHTML = '<p>등록된 사용자 정의 카테고리가 없습니다. 기본 카테고리(교재비, 급식비 등)는 자동으로 사용 가능합니다.</p>';
            return;
        }

        listEl.innerHTML = categories.map(cat => `
            <div class="data-item" data-id="${cat.id}">
                <div class="data-item-info">
                    <span class="name">${cat.name}</span>
                    <span class="details">유치원: ${kgMap[cat.kindergarten_id] || '알 수 없음'}</span>
                </div>
                <div class="data-item-actions">
                    <button class="btn btn-danger btn-small delete-category">삭제</button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.delete-category').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const item = e.target.closest('.data-item');
                const id = parseInt(item.dataset.id);
                if (confirm('카테고리를 삭제하시겠습니까?')) {
                    await deleteCategory(id);
                }
            });
        });
    } catch (error) {
        listEl.innerHTML = components.alert('카테고리 목록을 불러오는데 실패했습니다.', 'error');
    }
}

async function handleAddCategory(e) {
    e.preventDefault();

    const data = {
        name: document.getElementById('category-name').value.trim(),
        kindergarten_id: parseInt(document.getElementById('category-kindergarten').value)
    };

    if (!data.name || !data.kindergarten_id) {
        alert('유치원과 카테고리명을 입력해주세요.');
        return;
    }

    try {
        const result = await api.createExpenseCategory(data);
        if (result.detail) {
            alert(result.detail);
            return;
        }
        alert('카테고리가 추가되었습니다.');
        document.getElementById('add-category-form').reset();
        await loadCategoryList();
        await loadExpenseCategories();
    } catch (error) {
        alert('카테고리 추가에 실패했습니다.');
    }
}

async function deleteCategory(id) {
    try {
        await api.deleteExpenseCategory(id);
        alert('카테고리가 삭제되었습니다.');
        await loadCategoryList();
        await loadExpenseCategories();
    } catch (error) {
        alert('카테고리 삭제에 실패했습니다.');
    }
}

// ==================== Excel Export Functions ====================

// 엑셀 파일 다운로드 유틸리티
function downloadExcel(data, sheetName, fileName) {
    if (!window.XLSX) {
        alert('엑셀 라이브러리를 로드하는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName);
}

// 비용 내역 엑셀 다운로드
async function downloadExpensesExcel() {
    try {
        const expenses = await api.getExpenses();
        const students = await api.getStudents();
        const studentMap = {};
        students.forEach(s => studentMap[s.id] = s.name);

        if (expenses.length === 0) {
            alert('다운로드할 비용 내역이 없습니다.');
            return;
        }

        const data = expenses.map(e => ({
            '학생명': studentMap[e.student_id] || '알 수 없음',
            '카테고리': e.category,
            '금액': e.amount,
            '설명': e.description || '',
            '등록일': e.created_at ? new Date(e.created_at).toLocaleDateString('ko-KR') : ''
        }));

        const today = new Date().toISOString().slice(0, 10);
        downloadExcel(data, '비용내역', `비용내역_${today}.xlsx`);
    } catch (error) {
        console.error('Excel download error:', error);
        alert('엑셀 다운로드에 실패했습니다.');
    }
}

// 카테고리 목록 엑셀 다운로드
async function downloadCategoriesExcel() {
    try {
        const categories = await api.getExpenseCategories();
        const kindergartens = await api.getKindergartens();
        const kgMap = {};
        kindergartens.forEach(kg => kgMap[kg.id] = kg.name);

        // 기본 카테고리 + 사용자 정의 카테고리
        const data = [
            ...DEFAULT_CATEGORIES.map(cat => ({
                '카테고리명': cat,
                '유치원': '기본 카테고리',
                '유형': '기본'
            })),
            ...categories.map(cat => ({
                '카테고리명': cat.name,
                '유치원': kgMap[cat.kindergarten_id] || '알 수 없음',
                '유형': '사용자 정의'
            }))
        ];

        const today = new Date().toISOString().slice(0, 10);
        downloadExcel(data, '카테고리목록', `카테고리목록_${today}.xlsx`);
    } catch (error) {
        console.error('Excel download error:', error);
        alert('엑셀 다운로드에 실패했습니다.');
    }
}

// 학생별 집계 엑셀 다운로드
async function downloadStudentSummaryExcel() {
    const studentId = document.getElementById('student-summary-student').value;
    if (!studentId) {
        alert('학생을 먼저 선택하고 조회해주세요.');
        return;
    }

    try {
        const summary = await api.getStudentSummary(studentId);
        const studentName = summary.student_name || '알 수 없음';
        const total = summary.total || 0;
        const expenseCount = summary.expense_count || 0;

        const data = [
            { '항목': '학생명', '내용': studentName },
            { '항목': '총 비용', '내용': total.toLocaleString() + '원' },
            { '항목': '비용 건수', '내용': expenseCount + '건' },
            { '항목': '', '내용': '' },
            { '항목': '=== 카테고리별 상세 ===', '내용': '' }
        ];

        if (summary.by_category) {
            Object.entries(summary.by_category).forEach(([category, amount]) => {
                data.push({ '항목': category, '내용': amount.toLocaleString() + '원' });
            });
        }

        const today = new Date().toISOString().slice(0, 10);
        downloadExcel(data, '학생별집계', `학생별집계_${studentName}_${today}.xlsx`);
    } catch (error) {
        console.error('Excel download error:', error);
        alert('엑셀 다운로드에 실패했습니다.');
    }
}

// 반별 집계 엑셀 다운로드
async function downloadClassSummaryExcel() {
    const classId = document.getElementById('summary-class').value;
    if (!classId) {
        alert('반을 먼저 선택하고 조회해주세요.');
        return;
    }

    try {
        const summary = await api.getClassSummary(classId);
        const className = summary.class_name || '알 수 없음';
        const total = summary.total || 0;
        const studentCount = summary.student_count || 0;

        const data = [
            { '항목': '반명', '내용': className },
            { '항목': '총 비용', '내용': total.toLocaleString() + '원' },
            { '항목': '학생 수', '내용': studentCount + '명' },
            { '항목': '', '내용': '' },
            { '항목': '=== 카테고리별 상세 ===', '내용': '' }
        ];

        if (summary.by_category) {
            Object.entries(summary.by_category).forEach(([category, amount]) => {
                data.push({ '항목': category, '내용': amount.toLocaleString() + '원' });
            });
        }

        const today = new Date().toISOString().slice(0, 10);
        downloadExcel(data, '반별집계', `반별집계_${className}_${today}.xlsx`);
    } catch (error) {
        console.error('Excel download error:', error);
        alert('엑셀 다운로드에 실패했습니다.');
    }
}

// 유치원 집계 엑셀 다운로드
async function downloadKindergartenSummaryExcel() {
    if (!state.currentUser || !state.currentUser.kindergarten_name) {
        alert('유치원 정보가 없습니다. 먼저 조회해주세요.');
        return;
    }

    try {
        const kindergartens = await api.getKindergartens();
        const myKindergarten = kindergartens.find(kg => kg.name === state.currentUser.kindergarten_name);

        if (!myKindergarten) {
            alert('유치원 정보를 찾을 수 없습니다.');
            return;
        }

        const summary = await api.getKindergartenSummary(myKindergarten.id);
        const kgName = summary.kindergarten_name || state.currentUser.kindergarten_name;
        const total = summary.total || 0;
        const classCount = summary.class_count || 0;
        const studentCount = summary.student_count || 0;

        const data = [
            { '항목': '유치원명', '내용': kgName },
            { '항목': '총 비용', '내용': total.toLocaleString() + '원' },
            { '항목': '반 수', '내용': classCount + '개' },
            { '항목': '학생 수', '내용': studentCount + '명' },
            { '항목': '', '내용': '' },
            { '항목': '=== 카테고리별 상세 ===', '내용': '' }
        ];

        if (summary.by_category) {
            Object.entries(summary.by_category).forEach(([category, amount]) => {
                data.push({ '항목': category, '내용': amount.toLocaleString() + '원' });
            });
        }

        const today = new Date().toISOString().slice(0, 10);
        downloadExcel(data, '유치원집계', `유치원집계_${kgName}_${today}.xlsx`);
    } catch (error) {
        console.error('Excel download error:', error);
        alert('엑셀 다운로드에 실패했습니다.');
    }
}

// ==================== AI Assistant Functions ====================

async function loadAIAssistant() {
    const statusEl = document.getElementById('ai-status');
    statusEl.innerHTML = '<span class="loading-text">AI 상태 확인 중...</span>';

    try {
        const status = await api.getAIStatus();
        if (status.available) {
            statusEl.innerHTML = '<span class="status-ok">AI 서비스가 정상 작동 중입니다.</span>';
        } else {
            statusEl.innerHTML = '<span class="status-error">AI 서비스를 사용할 수 없습니다. 관리자에게 문의하세요.</span>';
        }
    } catch (error) {
        statusEl.innerHTML = '<span class="status-error">AI 상태를 확인할 수 없습니다.</span>';
    }
}

async function handleObservationSubmit(e) {
    e.preventDefault();

    const btn = document.getElementById('generate-observation');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    btn.disabled = true;

    const data = {
        student_name: document.getElementById('obs-student-name').value.trim(),
        age: parseInt(document.getElementById('obs-age').value) || 5,
        area: document.getElementById('obs-area').value,
        keywords: document.getElementById('obs-keywords').value.trim()
    };

    try {
        const result = await api.generateObservation(data);
        const resultEl = document.getElementById('observation-result');

        if (result.error || result.detail) {
            resultEl.innerHTML = `<p class="error-text">${result.error || result.detail}</p>`;
            document.getElementById('copy-observation').style.display = 'none';
        } else {
            resultEl.innerHTML = `<div class="ai-generated-text">${formatAIResponse(result.result)}</div>`;
            document.getElementById('copy-observation').style.display = 'inline-block';
        }
    } catch (error) {
        document.getElementById('observation-result').innerHTML = '<p class="error-text">생성에 실패했습니다. 다시 시도해주세요.</p>';
        document.getElementById('copy-observation').style.display = 'none';
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }
}

async function handleAssessmentSubmit(e) {
    e.preventDefault();

    const btn = document.getElementById('generate-assessment');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');

    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    btn.disabled = true;

    const data = {
        student_name: document.getElementById('assess-student-name').value.trim(),
        age: parseInt(document.getElementById('assess-age').value) || 5,
        area: document.getElementById('assess-area').value,
        level: document.getElementById('assess-level').value
    };

    try {
        const result = await api.generateAssessment(data);
        const resultEl = document.getElementById('assessment-result');

        if (result.error || result.detail) {
            resultEl.innerHTML = `<p class="error-text">${result.error || result.detail}</p>`;
            document.getElementById('copy-assessment').style.display = 'none';
        } else {
            resultEl.innerHTML = `<div class="ai-generated-text">${formatAIResponse(result.result)}</div>`;
            document.getElementById('copy-assessment').style.display = 'inline-block';
        }
    } catch (error) {
        document.getElementById('assessment-result').innerHTML = '<p class="error-text">생성에 실패했습니다. 다시 시도해주세요.</p>';
        document.getElementById('copy-assessment').style.display = 'none';
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }
}

async function handleConsultationSubmit(e) {
    e.preventDefault();

    const btn = document.getElementById('generate-consultation');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');

    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    btn.disabled = true;

    const data = {
        student_name: document.getElementById('consult-student-name').value.trim(),
        parent_name: document.getElementById('consult-parent-name').value.trim(),
        topics: document.getElementById('consult-topics').value.trim(),
        notes: document.getElementById('consult-notes').value.trim()
    };

    try {
        const result = await api.generateConsultation(data);
        const resultEl = document.getElementById('consultation-result');

        if (result.error || result.detail) {
            resultEl.innerHTML = `<p class="error-text">${result.error || result.detail}</p>`;
            document.getElementById('copy-consultation').style.display = 'none';
        } else {
            resultEl.innerHTML = `<div class="ai-generated-text">${formatAIResponse(result.result)}</div>`;
            document.getElementById('copy-consultation').style.display = 'inline-block';
        }
    } catch (error) {
        document.getElementById('consultation-result').innerHTML = '<p class="error-text">생성에 실패했습니다. 다시 시도해주세요.</p>';
        document.getElementById('copy-consultation').style.display = 'none';
    } finally {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }
}

function formatAIResponse(text) {
    // Convert newlines to <br> and escape HTML
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>');
}

function copyToClipboard(type) {
    const resultEl = document.getElementById(`${type}-result`);
    const textEl = resultEl.querySelector('.ai-generated-text');

    if (!textEl) {
        alert('복사할 내용이 없습니다.');
        return;
    }

    // Get text content (convert <br> back to newlines)
    const text = textEl.innerHTML
        .replace(/<br>/g, '\n')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');

    navigator.clipboard.writeText(text).then(() => {
        alert('클립보드에 복사되었습니다.');
    }).catch(err => {
        console.error('Copy failed:', err);
        alert('복사에 실패했습니다. 텍스트를 직접 선택하여 복사해주세요.');
    });
}
