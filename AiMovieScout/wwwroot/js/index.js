// ========== УПРАВЛЕНИЕ ИЗБРАННЫМ (localStorage) ==========
let favorites = JSON.parse(localStorage.getItem('movie_scout_favorites') || '[]');

function saveFavorites() {
    localStorage.setItem('movie_scout_favorites', JSON.stringify(favorites));
    updateFavCounter();
    renderFavoritesModal();
}

function updateFavCounter() {
    const counterSpan = document.getElementById('favoritesCount');
    if (counterSpan) counterSpan.innerText = favorites.length;
}

function isFavorite(movieId) {
    return favorites.some(f => f.id === movieId);
}

function addToFavorite(movie) {
    if (!isFavorite(movie.id)) {
        favorites.push(movie);
        saveFavorites();
        return true;
    }
    return false;
}

function removeFromFavorite(movieId) {
    favorites = favorites.filter(f => f.id !== movieId);
    saveFavorites();
    return true;
}

function toggleFavorite(movie, btnElement) {
    if (isFavorite(movie.id)) {
        removeFromFavorite(movie.id);
        if (btnElement) {
            btnElement.classList.remove('active');
            btnElement.innerHTML = '<i class="far fa-heart"></i>';
        }
    } else {
        addToFavorite(movie);
        if (btnElement) {
            btnElement.classList.add('active');
            btnElement.innerHTML = '<i class="fas fa-heart"></i>';
        }
    }
    renderFavoritesModal();
}

function renderFavoritesModal() {
    const container = document.getElementById('favoritesListContainer');
    if (!container) return;

    if (favorites.length === 0) {
        container.innerHTML = '<div class="empty-favorites"><i class="far fa-heart fa-2x mb-2"></i><br/>Нет избранных фильмов. Добавьте понравившиеся карточки ❤️</div>';
        return;
    }

    let html = '';
    favorites.forEach((fav, idx) => {
        html += `
            <div class="favorite-item" data-fav-id="${fav.id}">
                <div class="favorite-item-info">
                    <h5 class="mb-1">🎬 ${escapeHtml(fav.title)}</h5>
                    <div class="small text-secondary">${fav.year || ''} | ${fav.genre || ''}</div>
                </div>
                <button class="remove-fav-btn" data-id="${fav.id}"><i class="fas fa-trash-alt"></i> Удалить</button>
            </div>
        `;
    });
    container.innerHTML = html;

    document.querySelectorAll('.remove-fav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            removeFromFavorite(id);
            updateAllFavoriteButtons();
        });
    });
}

function updateAllFavoriteButtons() {
    document.querySelectorAll('.favorite-icon-btn').forEach(btn => {
        const movieId = btn.getAttribute('data-movie-id');
        if (movieId && isFavorite(movieId)) {
            btn.classList.add('active');
            btn.innerHTML = '<i class="fas fa-heart"></i>';
        } else if (movieId) {
            btn.classList.remove('active');
            btn.innerHTML = '<i class="far fa-heart"></i>';
        }
    });
}

// ========== AI-ЛОГИКА РЕКОМЕНДАЦИЙ ==========
async function getRecommendationsFromAI(favoriteMovies) {
    console.log("Отправляю в AI фильмы:", favoriteMovies);
    await new Promise(resolve => setTimeout(resolve, 600));

    const mockDatabase = {
        default: [
            { title: "Нечто", year: 1982, genre: "Научная фантастика, хоррор", reason: "Атмосфера изоляции и борьбы с неизвестным — идеально для фанатов ‘Достучаться до небес’." },
            { title: "Побег из Шоушенка", year: 1994, genre: "Драма", reason: "Тема надежды и дружбы, пронзительная судьба — близка к ‘Титанику’ и ‘Достучаться до небес’." },
            { title: "Облачный атлас", year: 2012, genre: "Фантастика, драма", reason: "Путешествие сквозь судьбы, чувство неизбежного и возвышенного — откликнется фанатам ‘Титаника’." },
            { title: "В диких условиях", year: 2007, genre: "Приключения, драма", reason: "Свобода, поиск себя и финальный катарсис — перекликается с философией ‘Достучаться до небес’." },
            { title: "Вечное сияние чистого разума", year: 2004, genre: "Романтика, фантастика", reason: "Глубокая эмоциональная связь и потеря — как в любовной линии ‘Титаника’." }
        ]
    };

    let recommendations = [...mockDatabase.default];
    if (favoriteMovies.toLowerCase().includes("боевик") || favoriteMovies.toLowerCase().includes("экшн")) {
        recommendations = [
            { title: "Джон Уик", year: 2014, genre: "Боевик", reason: "стильный экшн и жажда мести — динамика держит до конца." },
            { title: "Тёмный рыцарь", year: 2008, genre: "Боевик, драма", reason: "напряжённый сюжет, харизматичный герой и глубокий конфликт." }
        ];
    }
    return recommendations;
}

function renderRecommendations(recommendations) {
    const resultsDiv = document.getElementById('resultsArea');
    if (!recommendations || recommendations.length === 0) {
        resultsDiv.innerHTML = `<div class="col-12"><div class="alert alert-secondary text-center bg-dark text-light">😔 Не удалось подобрать фильмы. Попробуйте другие названия.</div></div>`;
        return;
    }

    let cardsHtml = '';
    for (let i = 0; i < recommendations.length; i++) {
        const rec = recommendations[i];
        const movieId = `rec_${rec.title.replace(/\s/g, '_')}_${rec.year}`;
        const isFav = isFavorite(movieId);
        const favBtnClass = isFav ? 'active' : '';
        const favBtnText = isFav ? '<i class="fas fa-heart"></i>' : '<i class="far fa-heart"></i>';

        cardsHtml += `
            <div class="col-12 col-md-6 col-lg-6">
                <div class="recommend-card h-100">
                    <div class="d-flex justify-content-between align-items-start flex-wrap">
                        <h4 class="fw-bold mb-2">${escapeHtml(rec.title)}</h4>
                        <button class="favorite-icon-btn ${favBtnClass}" data-movie-id="${movieId}" data-movie-title="${escapeHtml(rec.title)}" data-movie-year="${rec.year}" data-movie-genre="${escapeHtml(rec.genre)}">
                            ${favBtnText}
                        </button>
                    </div>
                    <div class="d-flex flex-wrap gap-2 mb-3">
                        <span class="badge badge-year px-3 py-2 rounded-pill">📅 ${rec.year}</span>
                        <span class="badge badge-genre px-3 py-2 rounded-pill">🎭 ${escapeHtml(rec.genre)}</span>
                    </div>
                    <p class="mb-0 mt-2"><em>✨ ${escapeHtml(rec.reason)}</em></p>
                </div>
            </div>
        `;
    }
    resultsDiv.innerHTML = cardsHtml;

    document.querySelectorAll('.favorite-icon-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const movieId = btn.getAttribute('data-movie-id');
            const movieTitle = btn.getAttribute('data-movie-title');
            const movieYear = btn.getAttribute('data-movie-year');
            const movieGenre = btn.getAttribute('data-movie-genre');
            const movieObj = {
                id: movieId,
                title: movieTitle,
                year: movieYear,
                genre: movieGenre
            };
            if (isFavorite(movieId)) {
                removeFromFavorite(movieId);
                btn.classList.remove('active');
                btn.innerHTML = '<i class="far fa-heart"></i>';
            } else {
                addToFavorite(movieObj);
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-heart"></i>';
            }
            renderFavoritesModal();
        });
    });

    document.getElementById('recommendationsBlock').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== ОБРАБОТЧИКИ ==========
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('recommendForm');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('moviesInput').value.trim();
            if (!input) {
                alert('Пожалуйста, введите хотя бы один любимый фильм');
                return;
            }

            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = '🎞️ Анализируем сюжеты...';
            submitBtn.disabled = true;

            try {
                const recommendations = await getRecommendationsFromAI(input);
                renderRecommendations(recommendations);
            } catch (error) {
                console.error("Ошибка", error);
                document.getElementById('resultsArea').innerHTML = `<div class="col-12"><div class="alert alert-danger">⚠️ Ошибка сервиса. Попробуйте позже.</div></div>`;
            } finally {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Модалка избранного
    const modal = document.getElementById('favoritesModal');
    const openFavBtn = document.getElementById('favoritesBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (openFavBtn) {
        openFavBtn.addEventListener('click', () => {
            renderFavoritesModal();
            modal.style.display = 'flex';
        });
    }
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    if (modal) {
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    updateFavCounter();
});