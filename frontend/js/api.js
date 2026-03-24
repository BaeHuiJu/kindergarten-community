// Detect environment and set API base URL
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:8888/api'
    : '/api';

// Simple cache for frequently accessed data
const cache = {
    data: {},
    ttl: 30000, // 30 seconds cache
    set(key, value) {
        this.data[key] = { value, timestamp: Date.now() };
    },
    get(key) {
        const item = this.data[key];
        if (!item) return null;
        if (Date.now() - item.timestamp > this.ttl) {
            delete this.data[key];
            return null;
        }
        return item.value;
    },
    clear(key) {
        if (key) delete this.data[key];
        else this.data = {};
    }
};

const api = {
    // Helper to get auth headers
    getAuthHeaders() {
        const token = localStorage.getItem('kindergarten_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    },

    // Users
    async getUsers(all = false) {
        let url = `${API_BASE}/users/`;
        if (all) url += '?all=true';
        const res = await fetch(url, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async getUser(id) {
        const res = await fetch(`${API_BASE}/users/${id}`, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async createUser(data) {
        const res = await fetch(`${API_BASE}/users/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async updateUser(id, data) {
        const res = await fetch(`${API_BASE}/users/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Posts
    async getPosts(category = null) {
        let url = `${API_BASE}/posts/`;
        if (category) url += `?category=${encodeURIComponent(category)}`;
        const res = await fetch(url, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async getPost(id) {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async createPost(data) {
        const res = await fetch(`${API_BASE}/posts/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async updatePost(id, data) {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deletePost(id) {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    // Comments
    async getComments(postId) {
        const res = await fetch(`${API_BASE}/comments/post/${postId}`, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async createComment(data) {
        const res = await fetch(`${API_BASE}/comments/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deleteComment(id) {
        const res = await fetch(`${API_BASE}/comments/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    // Kindergartens (with caching)
    async getKindergartens(forceRefresh = false) {
        const cacheKey = 'kindergartens';
        if (!forceRefresh) {
            const cached = cache.get(cacheKey);
            if (cached) return cached;
        }
        const res = await fetch(`${API_BASE}/students/kindergartens/`);
        const data = await res.json();
        cache.set(cacheKey, data);
        return data;
    },

    async createKindergarten(data) {
        const res = await fetch(`${API_BASE}/students/kindergartens/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        cache.clear('kindergartens'); // Clear cache after create
        return res.json();
    },

    async deleteKindergarten(id) {
        const res = await fetch(`${API_BASE}/students/kindergartens/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        cache.clear('kindergartens'); // Clear cache after delete
        return res.json();
    },

    async getMyKindergarten() {
        const res = await fetch(`${API_BASE}/kindergartens/my`, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    // Classes (with caching)
    async getClasses(kindergartenId = null, forceRefresh = false) {
        const cacheKey = 'classes_' + (kindergartenId || 'all');
        if (!forceRefresh) {
            const cached = cache.get(cacheKey);
            if (cached) return cached;
        }
        let url = `${API_BASE}/students/classes/`;
        if (kindergartenId) url += `?kindergarten_id=${kindergartenId}`;
        const res = await fetch(url, {
            headers: this.getAuthHeaders()
        });
        const data = await res.json();
        cache.set(cacheKey, data);
        return data;
    },

    async createClass(data) {
        const res = await fetch(`${API_BASE}/students/classes/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        cache.clear(); // Clear all cache after create
        return res.json();
    },

    async deleteClass(id) {
        const res = await fetch(`${API_BASE}/students/classes/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        cache.clear(); // Clear all cache after delete
        return res.json();
    },

    async getMyClasses() {
        const res = await fetch(`${API_BASE}/classes/my`, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    // Students
    async getStudents(classId = null) {
        let url = `${API_BASE}/students/`;
        if (classId) url += `?class_id=${classId}`;
        const res = await fetch(url, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async getMyStudents() {
        const res = await fetch(`${API_BASE}/students/my`, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async createStudent(data) {
        const res = await fetch(`${API_BASE}/students/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deleteStudent(id) {
        const res = await fetch(`${API_BASE}/students/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    // Expenses
    async getExpenses(studentId = null) {
        let url = `${API_BASE}/expenses/`;
        if (studentId) url += `?student_id=${studentId}`;
        const res = await fetch(url, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async getMyExpenses() {
        const res = await fetch(`${API_BASE}/expenses/my`, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async createExpense(data) {
        const res = await fetch(`${API_BASE}/expenses/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deleteExpense(id) {
        const res = await fetch(`${API_BASE}/expenses/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async getClassSummary(classId) {
        const res = await fetch(`${API_BASE}/expenses/summary/class/${classId}`, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async getKindergartenSummary(kindergartenId) {
        const res = await fetch(`${API_BASE}/expenses/summary/kindergarten/${kindergartenId}`, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async getStudentSummary(studentId) {
        const res = await fetch(`${API_BASE}/expenses/summary/student/${studentId}`, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async getMySummary() {
        const res = await fetch(`${API_BASE}/expenses/summary/my`, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    // Expense Categories
    async getExpenseCategories(kindergartenId = null) {
        let url = `${API_BASE}/expenses/categories/`;
        if (kindergartenId) url += `?kindergarten_id=${kindergartenId}`;
        const res = await fetch(url, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async createExpenseCategory(data) {
        const res = await fetch(`${API_BASE}/expenses/categories/`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deleteExpenseCategory(id) {
        const res = await fetch(`${API_BASE}/expenses/categories/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    // Excel Upload
    async uploadExcel(file) {
        const formData = new FormData();
        formData.append('file', file);

        const token = localStorage.getItem('kindergarten_token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE}/students/upload/excel`, {
            method: 'POST',
            headers: headers,
            body: formData
        });
        return res.json();
    },

    getTemplateDownloadUrl() {
        return `${API_BASE}/students/template/download`;
    },

    // AI Assistant
    async getAIStatus() {
        const res = await fetch(`${API_BASE}/ai/status`, {
            headers: this.getAuthHeaders()
        });
        return res.json();
    },

    async generateObservation(data) {
        const res = await fetch(`${API_BASE}/ai/observation`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async generateAssessment(data) {
        const res = await fetch(`${API_BASE}/ai/assessment`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async generateConsultation(data) {
        const res = await fetch(`${API_BASE}/ai/consultation`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Site Config
    async getConfig() {
        const cacheKey = 'site_config';
        const cached = cache.get(cacheKey);
        if (cached) return cached;

        try {
            const res = await fetch(`${API_BASE}/config`);
            const data = await res.json();
            cache.set(cacheKey, data);
            return data;
        } catch (error) {
            // Default fallback values
            return {
                siteName: '베베클럽',
                siteDescription: '유치원 선생님들을 위한 커뮤니티',
                expenseCategories: ['교재비', '급식비', '현장학습비', '특별활동비', '준비물비'],
                postCategories: ['자유게시판', '교육자료', 'Q&A'],
                observationAreas: ['사회관계', '의사소통', '신체운동', '예술경험', '자연탐구'],
                assessmentAreas: ['신체발달', '인지발달', '언어발달', '사회정서발달', '자조기술'],
                assessmentLevels: ['우수', '양호', '보통', '노력요함'],
                demoAccount: { username: 'test_user1', password: 'test123', label: '테스트 선생님' },
                quickAmounts: [5000, 10000, 30000, 50000]
            };
        }
    }
};

// Global site config storage
let siteConfig = null;

// Auto-apply site config on page load
async function applySiteConfig() {
    try {
        const config = await api.getConfig();
        siteConfig = config; // Store globally

        // Update page title
        const originalTitle = document.title;
        if (originalTitle.includes('베베클럽')) {
            document.title = originalTitle.replace('베베클럽', config.siteName);
        }

        // Update logo h1
        const logoH1 = document.querySelector('.logo h1');
        if (logoH1) logoH1.textContent = config.siteName;

        // Update auth header h1
        const authH1 = document.querySelector('.auth-header h1');
        if (authH1) authH1.textContent = config.siteName;

        // Update footer
        const footer = document.querySelector('footer p');
        if (footer && footer.textContent.includes('베베클럽')) {
            footer.textContent = footer.textContent.replace('베베클럽', config.siteName);
        }

        // Update post category tabs
        const categoryTabs = document.querySelector('.category-tabs');
        if (categoryTabs && config.postCategories) {
            const allTab = categoryTabs.querySelector('[data-category=""]');
            categoryTabs.innerHTML = '';
            if (allTab) categoryTabs.appendChild(allTab);
            config.postCategories.forEach(cat => {
                const btn = document.createElement('button');
                btn.dataset.category = cat;
                btn.className = 'tab';
                btn.textContent = cat;
                categoryTabs.appendChild(btn);
            });
        }

        // Update post category select
        const postCategorySelect = document.getElementById('post-category');
        if (postCategorySelect && config.postCategories) {
            postCategorySelect.innerHTML = config.postCategories.map(cat =>
                `<option value="${cat}">${cat}</option>`
            ).join('');
        }

        // Update quick amount buttons
        const quickAmountsContainer = document.querySelector('.quick-amounts');
        if (quickAmountsContainer && config.quickAmounts) {
            quickAmountsContainer.innerHTML = config.quickAmounts.map(amount => {
                const label = amount >= 10000 ? `+${amount/10000}만` : `+${amount/1000}천`;
                return `<button type="button" class="quick-amount" data-amount="${amount}">${label}</button>`;
            }).join('');
        }

        // Update demo account button
        const demoBtn = document.querySelector('.demo-btn');
        if (demoBtn && config.demoAccount) {
            demoBtn.dataset.username = config.demoAccount.username;
            demoBtn.dataset.password = config.demoAccount.password;
            demoBtn.textContent = `${config.demoAccount.label} (${config.demoAccount.username})`;
        }

        // Update observation areas select
        const obsAreaSelect = document.getElementById('obs-area');
        if (obsAreaSelect && config.observationAreas) {
            obsAreaSelect.innerHTML = config.observationAreas.map(area =>
                `<option value="${area}">${area}</option>`
            ).join('');
        }

        // Update assessment areas select
        const assessAreaSelect = document.getElementById('assess-area');
        if (assessAreaSelect && config.assessmentAreas) {
            assessAreaSelect.innerHTML = config.assessmentAreas.map(area =>
                `<option value="${area}">${area}</option>`
            ).join('');
        }

        // Update assessment levels select
        const assessLevelSelect = document.getElementById('assess-level');
        if (assessLevelSelect && config.assessmentLevels) {
            assessLevelSelect.innerHTML = config.assessmentLevels.map(level =>
                `<option value="${level}">${level}</option>`
            ).join('');
        }

        return config;
    } catch (error) {
        console.error('Failed to apply site config:', error);
    }
}

// Helper to get config (sync, returns cached or null)
function getConfigSync() {
    return siteConfig;
}

// Run on DOMContentLoaded
document.addEventListener('DOMContentLoaded', applySiteConfig);
