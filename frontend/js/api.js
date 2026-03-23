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

    // Stats (for homepage - always returns total counts)
    async getStats() {
        const res = await fetch(`${API_BASE}/stats/`);
        return res.json();
    },

    // Users
    async getUsers() {
        const res = await fetch(`${API_BASE}/users/`, {
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
    }
};
