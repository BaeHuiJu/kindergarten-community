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
        const categoryData = summary.by_category || summary.expenses_by_category || {};
        const categoryItems = Object.entries(categoryData)
            .map(([cat, amount]) => `<li><span>${cat}</span><span>${this.formatMoney(amount)}</span></li>`)
            .join('') || '<li>데이터 없음</li>';

        let title = '';
        if (type === 'student') {
            title = summary.student_name || '학생';
        } else if (type === 'class') {
            title = summary.class_name || '반';
        } else {
            title = summary.kindergarten_name || '유치원';
        }

        const totalAmount = summary.total || summary.total_expenses || 0;

        return `
            <div class="summary-card">
                <h3>${title}</h3>
                <div class="summary-stats">
                    ${type === 'kindergarten' ? `
                        <div class="summary-stat">
                            <div class="label">총 반 수</div>
                            <div class="value">${summary.class_count || summary.total_classes || 0}</div>
                        </div>
                    ` : ''}
                    ${type !== 'student' ? `
                        <div class="summary-stat">
                            <div class="label">총 학생 수</div>
                            <div class="value">${summary.student_count || summary.total_students || 0}명</div>
                        </div>
                    ` : ''}
                    ${type === 'student' ? `
                        <div class="summary-stat">
                            <div class="label">총 비용 건수</div>
                            <div class="value">${summary.expense_count || 0}건</div>
                        </div>
                    ` : ''}
                    <div class="summary-stat">
                        <div class="label">총 비용</div>
                        <div class="value">${this.formatMoney(totalAmount)}</div>
                    </div>
                </div>
                <div class="category-breakdown">
                    <h4>카테고리별 비용</h4>
                    <ul>${categoryItems}</ul>
                </div>
            </div>
        `;
    },

    profileCard(user, editMode = false) {
        if (editMode) {
            return `
                <div class="profile-card toss-style">
                    <div class="profile-header">
                        <div class="profile-avatar">${user.name.charAt(0)}</div>
                        <div class="profile-title">
                            <h3>${user.name} 선생님</h3>
                            <p class="profile-subtitle">프로필 수정</p>
                        </div>
                    </div>
                    <form id="profile-edit-form" class="toss-form">
                        <div class="form-section">
                            <div class="section-title">기본 정보</div>
                            <div class="readonly-field">
                                <span class="field-label">아이디</span>
                                <span class="field-value">${user.username}</span>
                            </div>
                            <div class="readonly-field">
                                <span class="field-label">이메일</span>
                                <span class="field-value">${user.email}</span>
                            </div>
                        </div>

                        <div class="form-section">
                            <div class="section-title">수정 가능</div>
                            <div class="toss-field">
                                <label for="edit-name">이름</label>
                                <input type="text" id="edit-name" value="${user.name}" required placeholder="이름을 입력하세요">
                            </div>
                            <div class="toss-field">
                                <label for="edit-region">근무 지역</label>
                                <input type="text" id="edit-region" value="${user.region || ''}" placeholder="예: 서울시 강남구">
                            </div>
                        </div>

                        <div class="form-section">
                            <div class="section-title">소속 정보</div>
                            <div class="toss-field">
                                <label for="edit-kindergarten">유치원 선택</label>
                                <select id="edit-kindergarten">
                                    <option value="">등록된 유치원에서 선택</option>
                                </select>
                            </div>
                            <div class="toss-field">
                                <label for="edit-kindergarten-name">유치원명 (직접 입력)</label>
                                <input type="text" id="edit-kindergarten-name" value="${user.kindergarten_name || ''}" placeholder="위에서 선택하거나 직접 입력">
                            </div>
                            <div class="toss-field">
                                <label for="edit-class">담당 반 선택</label>
                                <select id="edit-class">
                                    <option value="">등록된 반에서 선택</option>
                                </select>
                            </div>
                            <div class="toss-field">
                                <label for="edit-class-name">반 이름 (직접 입력)</label>
                                <input type="text" id="edit-class-name" value="${user.class_name || ''}" placeholder="위에서 선택하거나 직접 입력">
                            </div>
                        </div>

                        <div class="toss-actions">
                            <button type="button" id="cancel-profile-edit" class="btn-toss btn-toss-secondary">취소</button>
                            <button type="submit" class="btn-toss btn-toss-primary">저장하기</button>
                        </div>
                    </form>
                </div>
            `;
        }
        return `
            <div class="profile-card toss-style">
                <div class="profile-header">
                    <div class="profile-avatar">${user.name.charAt(0)}</div>
                    <div class="profile-title">
                        <h3>${user.name} 선생님</h3>
                        <p class="profile-subtitle">${user.kindergarten_name || '소속 미등록'}</p>
                    </div>
                </div>
                <div class="toss-info-list">
                    <div class="toss-info-item">
                        <span class="info-label">아이디</span>
                        <span class="info-value">${user.username}</span>
                    </div>
                    <div class="toss-info-item">
                        <span class="info-label">이메일</span>
                        <span class="info-value">${user.email}</span>
                    </div>
                    <div class="toss-info-item">
                        <span class="info-label">근무 지역</span>
                        <span class="info-value">${user.region || '-'}</span>
                    </div>
                    <div class="toss-info-item">
                        <span class="info-label">담당 반</span>
                        <span class="info-value">${user.class_name || '-'}</span>
                    </div>
                    <div class="toss-info-item">
                        <span class="info-label">가입일</span>
                        <span class="info-value">${this.formatDate(user.created_at)}</span>
                    </div>
                </div>
                <div class="toss-actions">
                    <button id="edit-profile-btn" class="btn-toss btn-toss-primary btn-toss-full">프로필 수정</button>
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
