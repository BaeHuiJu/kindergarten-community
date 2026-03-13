const components = {
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatMoney(amount) {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    },

    postCard(post) {
        const preview = post.content.length > 100
            ? post.content.substring(0, 100) + '...'
            : post.content;

        return `
            <div class="post-card" data-id="${post.id}">
                <div class="meta">
                    <span class="category">${post.category}</span>
                    <span>${post.author?.name || '익명'}</span>
                    <span>${this.formatDate(post.created_at)}</span>
                </div>
                <h3>${post.title}</h3>
                <p class="content-preview">${preview}</p>
            </div>
        `;
    },

    postDetail(post, isAuthor = false) {
        return `
            <span class="category">${post.category}</span>
            <h2>${post.title}</h2>
            <div class="post-meta">
                <span>작성자: ${post.author?.name || '익명'}</span> |
                <span>작성일: ${this.formatDate(post.created_at)}</span>
                ${post.updated_at !== post.created_at ? ` | <span>수정일: ${this.formatDate(post.updated_at)}</span>` : ''}
            </div>
            <div class="post-content">${post.content}</div>
            ${isAuthor ? `
                <div class="post-actions">
                    <button class="btn btn-secondary btn-small" id="edit-post-btn">수정</button>
                    <button class="btn btn-danger btn-small" id="delete-post-btn">삭제</button>
                </div>
            ` : ''}
        `;
    },

    comment(comment, currentUserId) {
        const isAuthor = comment.author_id === currentUserId;
        return `
            <div class="comment" data-id="${comment.id}">
                <div class="comment-meta">
                    <strong>${comment.author?.name || '익명'}</strong>
                    <span>${this.formatDate(comment.created_at)}</span>
                    ${isAuthor ? `<button class="btn btn-danger btn-small delete-comment">삭제</button>` : ''}
                </div>
                <div class="comment-content">${comment.content}</div>
            </div>
        `;
    },

    expenseItem(expense, studentName) {
        return `
            <div class="expense-item" data-id="${expense.id}">
                <span class="student-name">${studentName}</span>
                <span class="category">${expense.category}</span>
                <span class="description">${expense.description}</span>
                <span class="amount">${this.formatMoney(expense.amount)}</span>
                <button class="btn btn-danger btn-small delete-expense">삭제</button>
            </div>
        `;
    },

    summaryCard(summary, type = 'class') {
        const categoryItems = Object.entries(summary.expenses_by_category || {})
            .map(([cat, amount]) => `<li><span>${cat}</span><span>${this.formatMoney(amount)}</span></li>`)
            .join('') || '<li>데이터 없음</li>';

        return `
            <div class="summary-card">
                <h3>${type === 'class' ? summary.class_name : summary.kindergarten_name}</h3>
                <div class="summary-stats">
                    ${type === 'kindergarten' ? `
                        <div class="summary-stat">
                            <div class="label">총 반 수</div>
                            <div class="value">${summary.total_classes}</div>
                        </div>
                    ` : ''}
                    <div class="summary-stat">
                        <div class="label">총 학생 수</div>
                        <div class="value">${summary.total_students}명</div>
                    </div>
                    <div class="summary-stat">
                        <div class="label">총 비용</div>
                        <div class="value">${this.formatMoney(summary.total_expenses)}</div>
                    </div>
                </div>
                <div class="category-breakdown">
                    <h4>카테고리별 비용</h4>
                    <ul>${categoryItems}</ul>
                </div>
            </div>
        `;
    },

    profileCard(user) {
        return `
            <div class="profile-card">
                <h3>${user.name} 선생님</h3>
                <div class="profile-info">
                    <div class="info-item">
                        <span class="label">아이디</span>
                        <span>${user.username}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">이메일</span>
                        <span>${user.email}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">근무 지역</span>
                        <span>${user.region}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">유치원</span>
                        <span>${user.kindergarten_name}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">담당 반</span>
                        <span>${user.class_name}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">가입일</span>
                        <span>${this.formatDate(user.created_at)}</span>
                    </div>
                </div>
            </div>
        `;
    },

    loading() {
        return '<div class="loading">로딩 중...</div>';
    },

    alert(message, type = 'success') {
        return `<div class="alert alert-${type}">${message}</div>`;
    }
};
