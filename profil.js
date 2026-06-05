document.addEventListener('DOMContentLoaded', async () => {

    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');
    const container = document.getElementById('profileContainer');

    if (!username) { window.location.href = 'index.html'; return; }

    try {
        const userRes = await fetch(`https://api.github.com/users/${username}`);

        if (userRes.status === 404) { container.innerHTML = notFoundUI(username); return; }
        if (userRes.status === 403) { container.innerHTML = rateLimitUI(); return; }
        if (!userRes.ok) throw new Error('API hatası');

        const user = await userRes.json();
        const repos = await fetchAllRepos(username);

        document.title = `@${user.login} — GitHub Analizörü`;

        const langStats = calcLangStats(repos);
        const insights = calcInsights(user, repos);

        container.innerHTML = `
            ${backButton()}
            ${headerSection(user)}
            <div class="row g-4 mb-4">
                <div class="col-lg-7">${langSection(langStats)}</div>
                <div class="col-lg-5">${insightSection(insights)}</div>
            </div>
            ${repoSection(repos)}
        `;

        animateLangBars();
        initRepoFilter();

    } catch {
        container.innerHTML = networkErrUI();
    }

});

async function fetchAllRepos(username) {
    let allRepos = [];
    let page = 1;
    while (true) {
        const res = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=owner&page=${page}`);
        if (!res.ok) break;
        const data = await res.json();
        if (data.length === 0) break;
        allRepos = allRepos.concat(data);
        if (data.length < 100) break;
        page++;
    }
    return allRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
}

// VERİ HESAPLAMA (profil.html)

function calcLangStats(repos) {
    const counts = {};
    repos.forEach(r => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([lang, count]) => ({ lang, count, pct: Math.round((count / total) * 100) }));
}

function calcInsights(user, repos) {
    const joinedDate = new Date(user.created_at);
    const now = new Date();
    const ageYears = ((now - joinedDate) / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
    const repoPerYear = ageYears > 0 ? (user.public_repos / ageYears).toFixed(1) : user.public_repos;
    const ratio = user.following > 0 ? (user.followers / user.following).toFixed(2) : '∞';
    const stars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const joinedStr = joinedDate.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });

    return { ageYears, repoPerYear, ratio, stars, joinedStr };
}

// HTML RENDER FONKSİYONLARI (profil.html)

function backButton() {
    return `
        <a href="index.html" class="d-inline-flex align-items-center gap-2 mb-4 fw-medium animate-fade-up"
           style="color:var(--text-secondary);text-decoration:none;font-size:0.9rem;">
            <i class="bi bi-arrow-left"></i> Aramaya Dön
        </a>`;
}

function headerSection(u) {
    const location = u.location ? `<span class="me-3"><i class="bi bi-geo-alt me-1"></i>${escapeHTML(u.location)}</span>` : '';
    const blog = u.blog ? `<a href="${escapeHTML(u.blog)}" target="_blank" style="color:var(--text-secondary);text-decoration:none;"><i class="bi bi-link-45deg me-1"></i>${escapeHTML(u.blog)}</a>` : '';
    const bio = u.bio ? `<p class="mb-3" style="color:var(--text-secondary);line-height:1.7;max-width:600px;">${escapeHTML(u.bio)}</p>` : '';
    const company = u.company ? `<span class="me-3"><i class="bi bi-building me-1"></i>${escapeHTML(u.company)}</span>` : '';

    return `
        <div class="custom-card p-4 p-md-5 animate-fade-up mb-4">
            <div class="row align-items-center g-4">
                <div class="col-auto">
                    <img src="${escapeHTML(u.avatar_url)}" alt="${escapeHTML(u.login)}" class="rounded-circle"
                         style="width:110px;height:110px;object-fit:cover;border:2px solid var(--card-border);">
                </div>
                <div class="col">
                    <h1 class="fw-bolder mb-1" style="color:var(--text-color);font-size:1.8rem;">${escapeHTML(u.name) || escapeHTML(u.login)}</h1>
                    <p class="mb-2 fs-5" style="color:var(--text-secondary);">@${escapeHTML(u.login)}</p>
                    ${bio}
                    <div style="color:var(--text-secondary);font-size:0.88rem;">${company}${location}${blog}</div>
                </div>
                <div class="col-auto">
                    <a href="${escapeHTML(u.html_url)}" target="_blank" class="btn custom-btn d-flex align-items-center gap-2">
                        <i class="bi bi-github"></i> GitHub'da Aç
                    </a>
                </div>
            </div>

            <hr style="border-color:var(--card-border);margin:1.5rem 0;">

            <div class="row g-3 text-center">
                <div class="col-6 col-md-3">
                    <div class="stat-box">
                        <div class="fw-bolder fs-3" style="color:var(--text-color);">${formatNumber(u.followers)}</div>
                        <div style="color:var(--text-secondary);font-size:0.82rem;">Takipçi</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="stat-box">
                        <div class="fw-bolder fs-3" style="color:var(--text-color);">${formatNumber(u.following)}</div>
                        <div style="color:var(--text-secondary);font-size:0.82rem;">Takip Edilen</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="stat-box">
                        <div class="fw-bolder fs-3" style="color:var(--text-color);">${u.public_repos}</div>
                        <div style="color:var(--text-secondary);font-size:0.82rem;">Public Repo</div>
                    </div>
                </div>
                <div class="col-6 col-md-3">
                    <div class="stat-box">
                        <div class="fw-bolder fs-3" style="color:var(--text-color);">${u.public_gists}</div>
                        <div style="color:var(--text-secondary);font-size:0.82rem;">Public Gist</div>
                    </div>
                </div>
            </div>
        </div>`;
}

function langSection(langStats) {
    if (langStats.length === 0) {
        return `<div class="custom-card p-4 h-100 d-flex align-items-center justify-content-center" style="color:var(--text-secondary);">Dil verisi bulunamadı.</div>`;
    }
    const bars = langStats.map(({ lang, pct }) => {
        const color = getLangColor(lang);
        return `
            <div class="mb-3">
                <div class="d-flex justify-content-between mb-1">
                    <span style="color:var(--text-color);font-size:0.88rem;font-weight:500;">
                        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:6px;"></span>${escapeHTML(lang)}
                    </span>
                    <span style="color:var(--text-secondary);font-size:0.85rem;">${pct}%</span>
                </div>
                <div class="lang-bar-track">
                    <div class="lang-bar-fill" data-width="${pct}" style="width:0%;background:${color};"></div>
                </div>
            </div>`;
    }).join('');

    return `
        <div class="custom-card p-4 p-md-5 h-100 animate-fade-up delay-1">
            <h5 class="fw-bold mb-4" style="color:var(--text-color);">
                <i class="bi bi-code-slash me-2"></i>Dil Analizi
            </h5>
            ${bars}
        </div>`;
}

function insightSection(ins) {
    const rows = [
        { icon: 'bi-calendar3', label: 'Katılım Tarihi', value: ins.joinedStr },
        { icon: 'bi-hourglass-split', label: 'Hesap Yaşı', value: `${ins.ageYears} yıl` },
        { icon: 'bi-boxes', label: 'Yıllık Ortalama Repo', value: ins.repoPerYear },
        { icon: 'bi-people', label: 'Takipçi/Takip Oranı', value: ins.ratio },
        { icon: 'bi-star', label: 'Toplam Yıldız', value: formatNumber(ins.stars) },
    ].map(r => `
        <div class="insight-row">
            <span style="color:var(--text-secondary);font-size:0.88rem;"><i class="bi ${r.icon} me-2"></i>${r.label}</span>
            <span class="fw-semibold" style="color:var(--text-color);font-size:0.9rem;">${r.value}</span>
        </div>`).join('');

    return `
        <div class="custom-card p-4 p-md-5 h-100 animate-fade-up delay-2">
            <h5 class="fw-bold mb-4" style="color:var(--text-color);">
                <i class="bi bi-bar-chart-line me-2"></i>Genel Analiz
            </h5>
            ${rows}
        </div>`;
}

function repoSection(repos) {
    if (!repos || repos.length === 0) return '';

    const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];

    const pills = `
        <div id="repoFilter" class="d-flex flex-wrap gap-2 mb-4">
            <button class="filter-pill active" data-lang="all">Tümü (${repos.length})</button>
            ${languages.map(l => `<button class="filter-pill" data-lang="${escapeHTML(l)}">${escapeHTML(l)}</button>`).join('')}
        </div>`;

    const cards = repos.map(repo => {
        const color = getLangColor(repo.language);
        const desc = escapeHTML(repo.description) || 'Açıklama mevcut değil.';
        return `
            <div class="col-md-6 col-lg-4 repo-item" data-lang="${escapeHTML(repo.language || 'none')}">
                <a href="${escapeHTML(repo.html_url)}" target="_blank" class="text-decoration-none">
                    <div class="custom-card p-4 h-100">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h6 class="fw-bold mb-0" style="color:var(--text-color);font-size:0.9rem;">
                                <i class="bi bi-book me-2" style="color:var(--text-secondary);"></i>${escapeHTML(repo.name)}
                            </h6>
                            <span style="color:var(--text-secondary);font-size:0.82rem;white-space:nowrap;">
                                <i class="bi bi-star me-1"></i>${repo.stargazers_count}
                            </span>
                        </div>
                        <p style="color:var(--text-secondary);font-size:0.83rem;line-height:1.6;" class="mb-3">${desc}</p>
                        ${repo.language ? `<span class="badge" style="background:${color}20;color:${color};border:1px solid ${color}40;">${escapeHTML(repo.language)}</span>` : ''}
                    </div>
                </a>
            </div>`;
    }).join('');

    return `
        <div class="animate-fade-up delay-3">
            <h5 class="fw-bold mb-3" style="color:var(--text-secondary);font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;">
                <i class="bi bi-box-seam me-2"></i>Repolar
            </h5>
            ${pills}
            <div class="row g-3" id="repoGrid">${cards}</div>
        </div>`;
}

// HATA EKRANLARI (profil.html)

function notFoundUI(username) {
    return `
        <div class="custom-card p-5 text-center animate-fade-up">
            <div class="bento-icon mx-auto mb-4" style="border-color:#ef4444;color:#ef4444;"><i class="bi bi-person-x fs-3"></i></div>
            <h4 class="fw-bold mb-2" style="color:var(--text-color);">Kullanıcı Bulunamadı</h4>
            <p style="color:var(--text-secondary);"><strong>@${escapeHTML(username)}</strong> adlı bir GitHub hesabı mevcut değil.</p>
            <a href="index.html" class="btn custom-btn mt-3">← Aramaya Dön</a>
        </div>`;
}

function rateLimitUI() {
    return `
        <div class="custom-card p-5 text-center animate-fade-up">
            <div class="bento-icon mx-auto mb-4" style="border-color:#f59e0b;color:#f59e0b;"><i class="bi bi-hourglass-split fs-3"></i></div>
            <h4 class="fw-bold mb-2" style="color:var(--text-color);">Istek Limiti Aşıldı</h4>
            <p style="color:var(--text-secondary);">GitHub API saatlik istek limitine ulaşıldı. Lütfen biraz bekleyip tekrar deneyin.</p>
            <a href="index.html" class="btn custom-btn mt-3">← Aramaya Dön</a>
        </div>`;
}

function networkErrUI() {
    return `
        <div class="custom-card p-5 text-center animate-fade-up">
            <div class="bento-icon mx-auto mb-4" style="border-color:#f59e0b;color:#f59e0b;"><i class="bi bi-wifi-off fs-3"></i></div>
            <h4 class="fw-bold mb-2" style="color:var(--text-color);">Bağlantı Hatası</h4>
            <p style="color:var(--text-secondary);">GitHub API'sine ulaşılamadı.</p>
            <a href="index.html" class="btn custom-btn mt-3">← Aramaya Dön</a>
        </div>`;
}

function animateLangBars() {
    requestAnimationFrame(() => {
        document.querySelectorAll('.lang-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.width + '%';
        });
    });
}

function initRepoFilter() {
    document.querySelectorAll('#repoFilter .filter-pill').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#repoFilter .filter-pill').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const lang = btn.dataset.lang;
            document.querySelectorAll('.repo-item').forEach(item => {
                item.style.display = (lang === 'all' || item.dataset.lang === lang) ? '' : 'none';
            });
        });
    });
}
