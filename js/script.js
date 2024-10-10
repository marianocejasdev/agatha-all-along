const apiKey = '6c9230e59a7cb515c4f69b5c61dacb2d';
const seriesId = '138501';
const baseUrl = 'https://api.themoviedb.org/3/tv/';

async function fetchSeriesData() {
    try {
        const response = await fetch(`${baseUrl}${seriesId}?api_key=${apiKey}&language=en-US`);
        if (!response.ok) {
            throw new Error('Error al cargar la serie');
        }
        const data = await response.json();
        displaySeriesData(data);
        await fetchEpisodes(seriesId);
    } catch (error) {
        console.error('Error fetching series data:', error);
    }
}

async function fetchEpisodes(seriesId) {
    try {
        const seasonResponse = await fetch(`${baseUrl}${seriesId}/season/1?api_key=${apiKey}&language=en-US`);
        if (!seasonResponse.ok) {
            throw new Error('Error al cargar episodios');
        }
        const seasonData = await seasonResponse.json();
        displayEpisodes(seasonData.episodes);
    } catch (error) {
        console.error('Error fetching episodes:', error);
    }
}

function displayEpisodes(episodesData) {
    const carousel = document.querySelector('.main__episodes-carousel');
    carousel.innerHTML = '';

    const today = new Date();

    episodesData.forEach(episode => {
        const episodeAirDate = new Date(episode.air_date);

        if (episode.still_path && episodeAirDate <= today) {
            const episodeImg = document.createElement('img');
            episodeImg.src = `https://image.tmdb.org/t/p/w500${episode.still_path}`;
            episodeImg.alt = `Episode ${episode.episode_number}`;
            episodeImg.classList.add('main__episode-img');
            carousel.appendChild(episodeImg);
        }
    });
}


function displaySeriesData(data) {
    const year = new Date(data.first_air_date).getFullYear();
    document.querySelector('.main__info-list li:nth-child(1)').textContent = year;

    const genreItems = document.querySelectorAll('.main__info-list li:nth-child(n+2)');
    genreItems.forEach((item, index) => {
        item.textContent = index < data.genres.length ? data.genres[index].name : '';
        item.style.display = index < data.genres.length ? 'block' : 'none';
    });

    document.querySelector('.main__info-list li:last-child').textContent = `${data.number_of_seasons} Season`;
    document.querySelector('.main__description').textContent = data.overview;
}

function displayTrailer() {
    const overlay = document.getElementById('overlay');
    const trailerVideo = document.getElementById('trailerVideo');
    const buttonTrailer = document.getElementById('buttonTrailer');

    buttonTrailer.addEventListener('click', () => {
        const isHidden = trailerVideo.classList.toggle('hidden');
        overlay.classList.toggle('visible', !isHidden);
        handleVideoPlayback(isHidden);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeTrailer();
        }
    });

    function handleVideoPlayback(isHidden) {
        if (!isHidden) {
            trailerVideo.volume = 0.1;
            trailerVideo.play();
            document.addEventListener('click', handleOutsideClick);
        } else {
            closeTrailer();
        }
    }

    function handleOutsideClick(event) {
        const trailerVideo = document.getElementById('trailerVideo');
        if (!trailerVideo.contains(event.target) && !buttonTrailer.contains(event.target)) {
            closeTrailer();
        }
    }

    function closeTrailer() {
        trailerVideo.classList.add('hidden');
        overlay.classList.remove('visible');
        trailerVideo.pause();
        trailerVideo.currentTime = 0;
        document.removeEventListener('click', handleOutsideClick);
    }
}

function handleCarousel() {
    const carousel = document.querySelector('.main__episodes-carousel');

    carousel.addEventListener('wheel', (event) => {
        event.preventDefault();
        const scrollAmount = event.deltaY;
        smoothScroll(scrollAmount);
    });

    function smoothScroll(delta) {
        const amountToScroll = delta * 0.5;
        carousel.scrollLeft += amountToScroll;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchSeriesData();
    displayTrailer();
    handleCarousel();

});
