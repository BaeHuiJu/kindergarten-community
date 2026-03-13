const auth = {
    TOKEN_KEY: 'kindergarten_token',
    USER_KEY: 'kindergarten_user',

    // 토큰 저장
    setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    },

    // 토큰 가져오기
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    // 토큰 삭제
    removeToken() {
        localStorage.removeItem(this.TOKEN_KEY);
    },

    // 사용자 정보 저장
    setUser(user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    },

    // 사용자 정보 가져오기
    getUser() {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    // 사용자 정보 삭제
    removeUser() {
        localStorage.removeItem(this.USER_KEY);
    },

    // 로그인 여부 확인
    isLoggedIn() {
        return !!this.getToken();
    },

    // 로그인
    async login(username, password) {
        const errorEl = document.getElementById('error-message');
        errorEl.textContent = '';

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || '로그인에 실패했습니다.');
            }

            this.setToken(data.access_token);
            this.setUser(data.user);

            window.location.href = 'index.html';
            return data;
        } catch (error) {
            errorEl.textContent = error.message;
            throw error;
        }
    },

    // 회원가입
    async signup(userData) {
        const errorEl = document.getElementById('error-message');
        errorEl.textContent = '';

        try {
            const response = await fetch(`${API_BASE}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || '회원가입에 실패했습니다.');
            }

            this.setToken(data.access_token);
            this.setUser(data.user);

            window.location.href = 'index.html';
            return data;
        } catch (error) {
            errorEl.textContent = error.message;
            throw error;
        }
    },

    // 로그아웃
    logout() {
        this.removeToken();
        this.removeUser();
        window.location.href = 'login.html';
    },

    // 현재 사용자 정보 조회 (/me 엔드포인트)
    async fetchCurrentUser() {
        const token = this.getToken();
        if (!token) return null;

        try {
            const response = await fetch(`${API_BASE}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.logout();
                }
                throw new Error('Failed to fetch user');
            }

            const user = await response.json();
            this.setUser(user);
            return user;
        } catch (error) {
            console.error('Error fetching current user:', error);
            return null;
        }
    },

    // 인증이 필요한 API 요청 헬퍼
    async authFetch(url, options = {}) {
        const token = this.getToken();

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            this.logout();
            throw new Error('Session expired');
        }

        return response;
    },

    // 로그인 필요 페이지 체크
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // 네비게이션 바에 사용자 정보 표시
    updateNavbar() {
        const userInfo = document.querySelector('.user-info');
        if (!userInfo) return;

        const user = this.getUser();

        if (user) {
            userInfo.innerHTML = `
                <div class="user-bar">
                    <span class="user-name">${user.name} 선생님</span>
                    <button class="logout-btn" onclick="auth.logout()">로그아웃</button>
                </div>
            `;
        } else {
            userInfo.innerHTML = `
                <a href="login.html" class="btn btn-secondary">로그인</a>
            `;
        }
    }
};
