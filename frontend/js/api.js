// Detect environment and set API base URL
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:8001/api'
    : '/api';

const api = {
    // Users
    async getUsers() {
        const res = await fetch(`${API_BASE}/users/`);
        return res.json();
    },

    async getUser(id) {
        const res = await fetch(`${API_BASE}/users/${id}`);
        return res.json();
    },

    async createUser(data) {
        const res = await fetch(`${API_BASE}/users/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async updateUser(id, data) {
        const res = await fetch(`${API_BASE}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    // Posts
    async getPosts(category = null) {
        let url = `${API_BASE}/posts/`;
        if (category) url += `?category=${encodeURIComponent(category)}`;
        const res = await fetch(url);
        return res.json();
    },

    async getPost(id) {
        const res = await fetch(`${API_BASE}/posts/${id}`);
        return res.json();
    },

    async createPost(data) {
        const res = await fetch(`${API_BASE}/posts/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async updatePost(id, data) {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deletePost(id) {
        const res = await fetch(`${API_BASE}/posts/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Comments
    async getComments(postId) {
        const res = await fetch(`${API_BASE}/comments/post/${postId}`);
        return res.json();
    },

    async createComment(data) {
        const res = await fetch(`${API_BASE}/comments/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deleteComment(id) {
        const res = await fetch(`${API_BASE}/comments/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    // Kindergartens
    async getKindergartens() {
        const res = await fetch(`${API_BASE}/students/kindergartens/`);
        return res.json();
    },

    // Classes
    async getClasses(kindergartenId = null) {
        let url = `${API_BASE}/students/classes/`;
        if (kindergartenId) url += `?kindergarten_id=${kindergartenId}`;
        const res = await fetch(url);
        return res.json();
    },

    // Students
    async getStudents(classId = null) {
        let url = `${API_BASE}/students/`;
        if (classId) url += `?class_id=${classId}`;
        const res = await fetch(url);
        return res.json();
    },

    // Expenses
    async getExpenses(studentId = null) {
        let url = `${API_BASE}/expenses/`;
        if (studentId) url += `?student_id=${studentId}`;
        const res = await fetch(url);
        return res.json();
    },

    async createExpense(data) {
        const res = await fetch(`${API_BASE}/expenses/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return res.json();
    },

    async deleteExpense(id) {
        const res = await fetch(`${API_BASE}/expenses/${id}`, {
            method: 'DELETE'
        });
        return res.json();
    },

    async getClassSummary(classId) {
        const res = await fetch(`${API_BASE}/expenses/summary/class/${classId}`);
        return res.json();
    },

    async getKindergartenSummary(kindergartenId) {
        const res = await fetch(`${API_BASE}/expenses/summary/kindergarten/${kindergartenId}`);
        return res.json();
    }
};
