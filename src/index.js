import { fetchImages } from './js/fatch-img-src';
import { renderGallery } from './js/render-g';
import { onScroll, onToTopBtn } from './js/scroll';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.btn-load-more');
let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;

searchForm.addEventListener('submit', onSearchForm);
loadMoreBtn.addEventListener('click', onloadMoreBtn);

onScroll();
onToTopBtn();

async function onSearchForm(e) {
  e.preventDefault();
  window.scrollTo({ top: 0 });
  page = 1;
  query = e.currentTarget.searchQuery.value.trim();
  gallery.innerHTML = '';
  loadMoreBtn.classList.add('is-hidden');

  if (query === '') {
    alertNoEmptySearch();
    return;
  }
  
  try {
    let response = await fetchImages(query, page, perPage);
    let data = hadlingResponse(response);

    if (data.totalHits === 0) {
      alertNoImagesFound();
    } else {
      renderGallery(data.hits);
      simpleLightBox = new SimpleLightbox('.gallery a').refresh();
      alertImagesFound(data);
     if (data.totalHits > perPage) {
       loadMoreBtn.classList.remove('is-hidden');
     }
    }
  } catch (error) {
    console.log(error);
    alertUnexpectedError();
  } finally {
      searchForm.reset();
  }
}

async function onloadMoreBtn() {
  page += 1;
  simpleLightBox.destroy();

  try {
    let response = await fetchImages(query, page, perPage);
    let data = hadlingResponse(response);
    
    renderGallery(data.hits);
    simpleLightBox = new SimpleLightbox('.gallery a').refresh();

    const totalPages = Math.ceil(data.totalHits / perPage);

    if (page === totalPages) {
      loadMoreBtn.classList.add('is-hidden');
      alertEndOfSearch();
    }
  } catch (error) {
    console.log(error);
    alertUnexpectedError();
  }
}

function hadlingResponse(response) {
    if (response.status !== 200 || response==null) {
      console.log('Bad response from servet status=', response.status);
      alertUnexpectedResponse();
      return;
    } else {
      return response.data;
    }
}

function alertImagesFound(data) {
  Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
}

function alertNoEmptySearch() {
  Notiflix.Notify.failure(
    'The search string cannot be empty. Please specify your search query.'
  );
}

function alertNoImagesFound() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function alertEndOfSearch() {
  Notiflix.Notify.failure(
    "We're sorry, but you've reached the end of search results."
  );
}

function alertUnexpectedResponse() {
    Notiflix.Notify.failure(
      "We're sorry, but you've got unexpected rosponse from server."
    );
  };

function alertUnexpectedError() {
  Notiflix.Notify.failure(
    "We're sorry, but you've got unexpected error. See console for details."
  );
};
