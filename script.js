const apiKey = 'ac57bf5c'; // replace with your OMDb API key

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const themeToggleBtn = document.getElementById('themeToggle');
const charCountSpan = document.getElementById('charCount');
const searchStatus = document.getElementById('searchStatus');
const moviesContainer = document.getElementById('moviesContainer');
const watchlistContainer = document.getElementById('watchlistContainer');

let watchlist = []; // in-memory array for watchlist

// Update character count
searchInput.addEventListener('input', () => {
  charCountSpan.textContent = `Chars: ${searchInput.value.length}`;
});

// Search button event
searchBtn.addEventListener('click', () => {
  fetchMovies();
});

// Clear results
clearBtn.addEventListener('click', () => {
  moviesContainer.innerHTML = '';
  searchStatus.innerHTML = '';
});

// Toggle theme
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  // Optional: toggle button text/icon
  themeToggleBtn.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
});

// Fetch movies from OMDb API
async function fetchMovies() {
  const query = searchInput.value.trim();
  if (!query) return;
  
  searchStatus.innerHTML = `<div id="loading">Searching...</div>`;
  moviesContainer.innerHTML = '';

  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.Response === 'False') {
      searchStatus.innerHTML = `<div id="errorMsg">${data.Error}</div>`;
      return;
    }

    renderMovies(data.Search);
    searchStatus.innerHTML = '';
  } catch (error) {
    searchStatus.innerHTML = `<div id="errorMsg">Network error or invalid API key.</div>`;
  }
}

// Render fetched movies
function renderMovies(movies) {
  moviesContainer.innerHTML = '';
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';

    card.innerHTML = `
      <img class="movie-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title}">
      <div class="movie-info">
        <h3>${movie.Title}</h3>
        <p>${movie.Year} | ${movie.Type}</p>
      </div>
      <button class="add-watchlist">Add to Watchlist</button>
      <div class="movie-details"></div>
    `;

    // Hover effects are handled via CSS :hover

    // Show details on click
    card.addEventListener('click', () => {
      toggleDetails(card, movie.imdbID);
    });

    // Add to watchlist button
    const addBtn = card.querySelector('.add-watchlist');
    addBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent triggering card click
      addToWatchlist(movie);
    });

    moviesContainer.appendChild(card);
  });
}

// Toggle details display
async function toggleDetails(card, imdbID) {
  const detailsDiv = card.querySelector('.movie-details');
  if (detailsDiv.style.display === 'block') {
    detailsDiv.style.display = 'none';
    return;
  }

  // Fetch additional details
  try {
    const response = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}&plot=short`);
    const data = await response.json();
    if (data.Response === 'False') {
      detailsDiv.innerHTML = `<div>No details available.</div>`;
    } else {
      detailsDiv.innerHTML = `
        <p><strong>Plot:</strong> ${data.Plot}</p>
        <p><strong>Rating:</strong> ${data.imdbRating}</p>
        <p><strong>Actors:</strong> ${data.Actors}</p>
        <button class="remove-details">Close</button>
      `;
    }
    detailsDiv.style.display = 'block';

    // Close button
    const closeBtn = detailsDiv.querySelector('.remove-details');
    closeBtn.addEventListener('click', () => {
      detailsDiv.style.display = 'none';
    });
  } catch {
    detailsDiv.innerHTML = `<div>Error loading details.</div>`;
    detailsDiv.style.display = 'block';
  }
}

// Add movie to watchlist
function addToWatchlist(movie) {
  if (watchlist.some(w => w.imdbID === movie.imdbID)) {
    alert('Movie already in watchlist.');
    return;
  }
  watchlist.push(movie);
  renderWatchlist();
}

// Remove from watchlist
function removeFromWatchlist(imdbID) {
  watchlist = watchlist.filter(m => m.imdbID !== imdbID);
  renderWatchlist();
}

// Render watchlist
function renderWatchlist() {
  watchlistContainer.innerHTML = '';
  if (watchlist.length === 0) {
    watchlistContainer.innerHTML = '<p>No movies in watchlist.</p>';
    return;
  }
  watchlist.forEach(movie => {
    const item = document.createElement('div');
    item.className = 'movie-card';

    item.innerHTML = `
      <img class="movie-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title}">
      <div class="movie-info">
        <h3>${movie.Title}</h3>
      </div>
      <button class="remove-watchlist">Remove</button>
    `;

    // Remove button
    const removeBtn = item.querySelector('.remove-watchlist');
    removeBtn.addEventListener('click', () => {
      removeFromWatchlist(movie.imdbID);
    });

    // Optional: hover effects
    watchlistContainer.appendChild(item);
  });
}
