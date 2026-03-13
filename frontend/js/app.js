// State
const state = {
    currentUser: null,
    currentPost: null,
    editingPost: null,
    kindergartens: [],
    classes: [],
    students: []
};

// DOM Elements
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-links a');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // 인증 확인 및 사용자 설정
    if (auth.isLoggedIn()) {
        state.currentUser = auth.getUser();
        // 서버에서 최신 사용자 정보 가져오기
        const freshUser = await auth.fetchCurrentUser();
        if (freshUser) {
            state.currentUser = freshUser;
        }
    }

    // 네비게이션 바 업데이트
    auth.updateNavbar();

    await loadInitialData();
    setupEventListeners();
    showPage('home');
});

async function loadInitialData() {
    try {
        // Load kindergartens
        state.kindergartens = await api.getKindergartens();

        // Load home stats
        await loadHomeStats();
    } catch (error) {
        console.error('Failed to load initial data:', error);
    }
}

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
            // Fix: 'input' tab의 실제 ID는 'expense-input-tab'
            const tabId = tabName === 'input' ? 'expense-input-tab' : `${tabName}-tab`;
            const tabEl = document.getElementById(tabId);
            if (tabEl) {
                tabEl.classList.add('active');
            }
        });
    });

    // Expense form cascade
    document.getElementById('expense-kindergarten').addEventListener('change', async (e) => {
        const kgId = e.target.value;
        if (kgId) {
            state.classes = await api.getClasses(kgId);
            populateClassSelect('expense-class', state.classes);
        }
        document.getElementById('expense-class').value = '';
        document.getElementById('expense-student').innerHTML = '<option value="">선택하세요</option>';
    });

    document.getElementById('expense-class').addEventListener('change', async (e) => {
        const classId = e.target.value;
        if (classId) {
            state.students = await api.getStudents(classId);
            populateStudentSelect('expense-student', state.students);
        }
    });

    document.getElementById('expense-form').addEventListener('submit', handleExpenseSubmit);

    // Summary selects
    document.getElementById('summary-kindergarten').addEventListener('change', async (e) => {
        const kgId = e.target.value;
        if (kgId) {
            const classes = await api.getClasses(kgId);
            populateClassSelect('summary-class', classes);
        }
    });

    document.getElementById('load-class-summary').addEventListener('click', loadClassSummary);
    document.getElementById('load-kg-summary').addEventListener('click', loadKindergartenSummary);

    // Initialize kindergarten selects
    populateKindergartenSelects();
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
            loadExpenses();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

async function loadHomeStats() {
    try {
        const [posts, users, kindergartens] = await Promise.all([
            api.getPosts(),
            api.getUsers(),
            api.getKindergartens()
        ]);

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
    populateKindergartenSelects();

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

async function handleExpenseSubmit(e) {
    e.preventDefault();

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
        alert('비용 추가에 실패했습니다.');
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
    const kgId = document.getElementById('kg-summary-kindergarten').value;
    if (!kgId) {
        alert('유치원을 선택해주세요.');
        return;
    }

    try {
        const summary = await api.getKindergartenSummary(kgId);
        document.getElementById('kg-summary-result').innerHTML = components.summaryCard(summary, 'kindergarten');
    } catch (error) {
        alert('집계 조회에 실패했습니다.');
    }
}

function populateKindergartenSelects() {
    const selects = ['expense-kindergarten', 'summary-kindergarten', 'kg-summary-kindergarten'];
    selects.forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.innerHTML = '<option value="">선택하세요</option>';
            state.kindergartens.forEach(kg => {
                const option = document.createElement('option');
                option.value = kg.id;
                option.textContent = kg.name;
                select.appendChild(option);
            });
        }
    });
}

function populateClassSelect(selectId, classes) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">선택하세요</option>';
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = cls.name;
        select.appendChild(option);
    });
}

function populateStudentSelect(selectId, students) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">선택하세요</option>';
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.age}세)`;
        select.appendChild(option);
    });
}

function loadProfile() {
    const contentEl = document.getElementById('profile-content');
    if (!state.currentUser) {
        contentEl.innerHTML = `
            <p>로그인이 필요합니다.</p>
            <a href="login.html" class="btn btn-primary">로그인하기</a>
        `;
        return;
    }
    contentEl.innerHTML = components.profileCard(state.currentUser);
}
