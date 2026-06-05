document.addEventListener('DOMContentLoaded', () => {

    const themeBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const htmlTag = document.documentElement;
    const savedTheme = localStorage.getItem('app-theme');

    if (savedTheme === 'light') {
        htmlTag.setAttribute('data-bs-theme', 'light');
        setMoonIcon(themeIcon);
    } else {
        setSunIcon(themeIcon);
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const newTheme = htmlTag.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
            htmlTag.setAttribute('data-bs-theme', newTheme);
            newTheme === 'light' ? setMoonIcon(themeIcon) : setSunIcon(themeIcon);
            localStorage.setItem('app-theme', newTheme);
        });
    }

    renderHistory();

    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            localStorage.removeItem('search-history');
            renderHistory();
        });
    }

});

function setMoonIcon(el) { if (el) el.className = 'bi bi-moon-fill fs-5'; }
function setSunIcon(el) { if (el) el.className = 'bi bi-sun-fill fs-5'; }

function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getThemeColors() {
    const theme = document.documentElement.getAttribute('data-bs-theme');
    return {
        bgColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
        textColor: theme === 'dark' ? '#f5f5f5' : '#111111'
    };
}

// ARAMA GEÇMİŞİ (index.html)

function saveToHistory(username) {
    let history = loadHistory();
    history = [username, ...history.filter(u => u !== username)].slice(0, 5);
    localStorage.setItem('search-history', JSON.stringify(history));
    renderHistory();
}

function loadHistory() {
    try { return JSON.parse(localStorage.getItem('search-history')) || []; }
    catch { return []; }
}

function renderHistory() {
    const section = document.getElementById('historySection');
    const chips = document.getElementById('historyChips');
    if (!section || !chips) return;

    const history = loadHistory();
    if (history.length === 0) { section.style.display = 'none'; return; }

    section.style.display = 'block';
    chips.innerHTML = history.map(u => `
        <button class="history-chip" data-username="${escapeHTML(u)}">
            <i class="bi bi-person me-1"></i>@${escapeHTML(u)}
        </button>
    `).join('');

    chips.querySelectorAll('.history-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            if (searchInput) searchInput.value = chip.dataset.username;
            fetchGitHubUser(chip.dataset.username);
        });
    });
}

// ARAMA MANTIĞI (index.html)

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsContainer = document.getElementById('resultsContainer');

if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(); });
}

function handleSearch() {
    const kullaniciAdi = searchInput.value.trim();
    const { bgColor, textColor } = getThemeColors();

    if (!kullaniciAdi) {
        Swal.fire({ icon: 'error', title: 'Boş Bırakılamaz', text: 'Lütfen bir GitHub kullanıcı adı giriniz!', background: bgColor, color: textColor, confirmButtonColor: '#3b82f6' });
        return;
    }
    if (kullaniciAdi.includes(' ')) {
        Swal.fire({ icon: 'warning', title: 'Geçersiz Format', text: 'GitHub kullanıcı adları boşluk içeremez!', background: bgColor, color: textColor, confirmButtonColor: '#fe0000' });
        return;
    }

    saveToHistory(kullaniciAdi);
    fetchGitHubUser(kullaniciAdi);
}

// GITHUB API (index.html)

async function fetchGitHubUser(username) {
    showLoading();

    try {
        const [userRes, reposRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=6`)
        ]);

        if (userRes.status === 404) { showError(username); return; }
        if (userRes.status === 403) { showRateLimitError(); return; }
        if (!userRes.ok) throw new Error('API hatası');

        const userData = await userRes.json();
        const reposData = await reposRes.json();

        profilGoster(userData);
        repolariGoster(reposData);
        if (searchInput) searchInput.value = '';

    } catch { showNetworkError(); }
}

// LOADING (index.html)

function showLoading() {
    resultsContainer.innerHTML = `
        <div class="text-center py-5 animate-fade-up">
            <div class="spinner-border" style="color: var(--text-color); width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Yükleniyor...</span>
            </div>
            <p class="mt-3" style="color: var(--text-secondary);">GitHub verisi getiriliyor...</p>
        </div>`;
}

// PROFİL KARTI (index.html)

function profilGoster(data) {
    const name = escapeHTML(data.name) || escapeHTML(data.login);
    const login = escapeHTML(data.login);
    const bio = data.bio ? escapeHTML(data.bio) : '';
    const location = data.location ? escapeHTML(data.location) : '';
    const blog = data.blog ? escapeHTML(data.blog) : '';

    const locationHTML = location ? `<span class="me-3"><i class="bi bi-geo-alt me-1"></i>${location}</span>` : '';
    const blogHTML = blog ? `<a href="${blog}" target="_blank" style="color:var(--text-color);"><i class="bi bi-link-45deg me-1"></i>${blog}</a>` : '';
    const bioHTML = bio ? `<p class="mb-3" style="color:var(--text-secondary);line-height:1.7;">${bio}</p>` : '';

    resultsContainer.innerHTML = `
        <div class="custom-card p-4 p-md-5 animate-fade-up mb-4">
            <div class="row align-items-center g-4">
                <div class="col-auto">
                    <img src="${escapeHTML(data.avatar_url)}" alt="${login}" class="rounded-circle"
                         style="width:90px;height:90px;object-fit:cover;border:2px solid var(--card-border);">
                </div>
                <div class="col">
                    <h2 class="fw-bold mb-1" style="color:var(--text-color);">${name}</h2>
                    <p class="mb-2" style="color:var(--text-secondary);">@${login}</p>
                    ${bioHTML}
                    <div style="color:var(--text-secondary);font-size:0.9rem;">${locationHTML}${blogHTML}</div>
                </div>
            </div>

            <hr style="border-color:var(--card-border);margin:1.5rem 0;">

            <div class="row g-3 text-center mb-4">
                <div class="col-4">
                    <div class="custom-card p-3">
                        <div class="fw-bolder fs-3" style="color:var(--text-color);">${formatNumber(data.followers)}</div>
                        <div style="color:var(--text-secondary);font-size:0.85rem;">Takipçi</div>
                    </div>
                </div>
                <div class="col-4">
                    <div class="custom-card p-3">
                        <div class="fw-bolder fs-3" style="color:var(--text-color);">${formatNumber(data.following)}</div>
                        <div style="color:var(--text-secondary);font-size:0.85rem;">Takip</div>
                    </div>
                </div>
                <div class="col-4">
                    <div class="custom-card p-3">
                        <div class="fw-bolder fs-3" style="color:var(--text-color);">${formatNumber(data.public_repos)}</div>
                        <div style="color:var(--text-secondary);font-size:0.85rem;">Repo</div>
                    </div>
                </div>
            </div>

            <div class="d-flex gap-2 flex-wrap">
                <a href="${escapeHTML(data.html_url)}" target="_blank" class="btn custom-btn d-flex align-items-center gap-2" style="flex:1;">
                    <i class="bi bi-github"></i> GitHub'da Aç
                </a>
                <a href="profil.html?username=${login}" class="btn d-flex align-items-center gap-2 fw-semibold"
                   style="flex:1;border-radius:14px;border:1px solid var(--card-border);background:var(--card-bg);color:var(--text-color);padding:1rem 2rem;">
                    <i class="bi bi-bar-chart-line"></i> Detaylı Analiz
                </a>
            </div>
        </div>`;
}

// REPO LİSTESİ + DİL FİLTRESİ (index.html)

function repolariGoster(repos) {
    if (!repos || repos.length === 0) return;

    const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];

    const filterPills = `
        <div id="repoFilter" class="d-flex flex-wrap gap-2 mb-4">
            <button class="filter-pill active" data-lang="all">Tümü</button>
            ${languages.map(l => `<button class="filter-pill" data-lang="${escapeHTML(l)}">${escapeHTML(l)}</button>`).join('')}
        </div>`;

    const repoCardsHTML = repos.map(repo => {
        const langColor = getLangColor(repo.language);
        const desc = escapeHTML(repo.description) || 'Açıklama mevcut değil.';
        const repoName = escapeHTML(repo.name);
        return `
            <div class="col-md-6 repo-item" data-lang="${escapeHTML(repo.language || 'none')}">
                <a href="${escapeHTML(repo.html_url)}" target="_blank" class="text-decoration-none">
                    <div class="custom-card p-4 h-100">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="fw-bold mb-0" style="color:var(--text-color);">
                                <i class="bi bi-book me-2" style="color:var(--text-secondary);"></i>${repoName}
                            </h6>
                            <span style="color:var(--text-secondary);font-size:0.85rem;white-space:nowrap;">
                                <i class="bi bi-star me-1"></i>${repo.stargazers_count}
                            </span>
                        </div>
                        <p style="color:var(--text-secondary);font-size:0.88rem;line-height:1.6;" class="mb-3">${desc}</p>
                        ${repo.language ? `<span class="badge" style="background:${langColor}20;color:${langColor};border:1px solid ${langColor}40;">${escapeHTML(repo.language)}</span>` : ''}
                    </div>
                </a>
            </div>`;
    }).join('');

    resultsContainer.innerHTML += `
        <div class="animate-fade-up delay-1">
            <h5 class="fw-bold mb-3" style="color:var(--text-secondary);font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;">
                <i class="bi bi-box-seam me-2"></i>En Yıldızlı Repolar
            </h5>
            ${filterPills}
            <div class="row g-3" id="repoGrid">${repoCardsHTML}</div>
        </div>`;

    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const lang = btn.dataset.lang;
            document.querySelectorAll('.repo-item').forEach(item => {
                item.style.display = (lang === 'all' || item.dataset.lang === lang) ? '' : 'none';
            });
        });
    });
}

// HATA EKRANLARI (index.html)

function showError(username) {
    resultsContainer.innerHTML = `
        <div class="custom-card p-5 text-center animate-fade-up">
            <div class="bento-icon mx-auto mb-4" style="border-color:#ef4444;color:#ef4444;">
                <i class="bi bi-person-x fs-3"></i>
            </div>
            <h4 class="fw-bold mb-2" style="color:var(--text-color);">Kullanıcı Bulunamadı</h4>
            <p style="color:var(--text-secondary);"><strong style="color:var(--text-color);">@${escapeHTML(username)}</strong> adlı bir GitHub hesabı mevcut değil.</p>
        </div>`;
}

function showRateLimitError() {
    resultsContainer.innerHTML = `
        <div class="custom-card p-5 text-center animate-fade-up">
            <div class="bento-icon mx-auto mb-4" style="border-color:#f59e0b;color:#f59e0b;">
                <i class="bi bi-hourglass-split fs-3"></i>
            </div>
            <h4 class="fw-bold mb-2" style="color:var(--text-color);">İstek Limiti Aşıldı</h4>
            <p style="color:var(--text-secondary);">GitHub API saatlik istek limitine ulaşıldı. Lütfen biraz bekleyip tekrar deneyin.</p>
        </div>`;
}

function showNetworkError() {
    resultsContainer.innerHTML = `
        <div class="custom-card p-5 text-center animate-fade-up">
            <div class="bento-icon mx-auto mb-4" style="border-color:#f59e0b;color:#f59e0b;">
                <i class="bi bi-wifi-off fs-3"></i>
            </div>
            <h4 class="fw-bold mb-2" style="color:var(--text-color);">Bağlantı Hatası</h4>
            <p style="color:var(--text-secondary);">GitHub API'sine ulaşılamadı.</p>
        </div>`;
}

// YARDIMCI FONKSİYONLAR

function formatNumber(num) {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
}

function getLangColor(lang) {
    const colors = {
        JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
        HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', 'C#': '#239120',
        PHP: '#4F5D95', Ruby: '#701516', Go: '#00ADD8', Rust: '#dea584',
        Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB', 'C++': '#f34b7d',
        Shell: '#89e051', Vue: '#41b883', Svelte: '#ff3e00',
    };
    return colors[lang] || '#888888';
}

// İLETİŞİM FORMU (iletisim.html)

const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const messageInput = document.getElementById('messageInput');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const nameData = nameInput.value.trim();
        const emailData = emailInput.value.trim();
        const messageData = messageInput.value.trim();
        const { bgColor, textColor } = getThemeColors();

        if (!nameData || !emailData || !messageData) {
            Swal.fire({ icon: 'error', title: 'Eksik Bilgi', text: 'Lütfen tüm alanları doldurunuz!', background: bgColor, color: textColor, confirmButtonColor: '#fe0000' });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData)) {
            Swal.fire({ icon: 'warning', title: 'Geçersiz E-posta', text: 'Lütfen geçerli bir e-posta adresi giriniz.', background: bgColor, color: textColor, confirmButtonColor: '#3b82f6' });
            return;
        }
        Swal.fire({ icon: 'success', title: 'Gönderildi!', text: `Sayın ${nameData}, mesajınız bize ulaştı.`, background: bgColor, color: textColor, confirmButtonColor: '#10b981' })
            .then(() => contactForm.reset());
    });
}
