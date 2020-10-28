import r from '../core/core.js';
import { getData } from '../core/fetch.js';

const root = document.createElement('div');
const loadUi = `<div id='loading' class="d-flex justify-content-center my-5">
<div class="spinner-border" role="status">
    <span class="visually-hidden">Loading...</span>
</div>
</div>`;

root.className = 'container';
const urlParams = new URLSearchParams(window.location.search);
const link = urlParams.get('q') || 'all';
const url = `https://www.reddit.com/r/${link}.json`;
let a;

const fetchData = (l) => {
  root.innerHTML = loadUi;
  getData(l).then((d) => {
    const error = d.error || d.data.error

    const loading = document.getElementById('loading')
    if (error) {
      root.removeChild(loading);
      createCard('Error ' + error, '', null)
    }
    else if (d.data.data.children) {
      const data = d.data.data.children;
      a = d.data.data.after
      const isLoad = d.isLoad;
      if (data.length == 0) {
        createCard('Error Notfound', '', null)
      }
      if (!isLoad) {
        root.removeChild(loading);
      }
      try {
        data.forEach(element => {
          const wrapData = element.data;
          createCard(wrapData.title, wrapData.url, wrapData.secure_media || null);
        });
      } catch (error) {
        createCard('Error something is wrong' + error)
      }
    } else {
      root.removeChild(loading);
      createCard('Error something is wrong')
    }

  })
}

onscroll = () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
    fetchData(url + '?after=' + a)
  }
}

fetchData(url)

const createCard = (head, image, v) => {
  const card = document.createElement('div');
  const cardBody = document.createElement('div');


  cardBody.className = 'card-body';
  card.className = 'card my-3 mx-auto w-75'
  cardBody.innerHTML = `<h5 class="card-title">${head}</h5>`;

  if (v !== null) {
    const vdoEmbed = document.createElement('video')
    const vdoSrc = document.createElement('source')

    vdoEmbed.setAttribute("autoplay", "")
    vdoEmbed.setAttribute("loop", "")
    vdoEmbed.className = 'w-100'

    if (v.reddit_video) {
      vdoSrc.src = v.reddit_video.fallback_url;
      vdoEmbed.appendChild(vdoSrc)
      cardBody.appendChild(vdoEmbed);
    } else if (!v.oembed.provider_name) {
      vdoSrc.src = v.oembed.thumbnail_url.replace('size_restricted.gif', 'mobile.mp4')
      vdoEmbed.appendChild(vdoSrc)
      cardBody.appendChild(vdoEmbed);
    }
    else if (v.oembed.provider_name === 'YouTube') {
      const htmlWrap = document.createElement('div');
      htmlWrap.className = 'd-flex justify-content-center';
      htmlWrap.innerHTML = escapeHTML(v.oembed.html);
      htmlWrap.firstChild.src = htmlWrap.firstChild.src + '&autoplay=1&mute=1'
      cardBody.appendChild(htmlWrap);
    } else {
      vdoSrc.src = v.oembed.thumbnail_url.replace('-social-preview.jpg', '.mp4')
      vdoEmbed.muted = true
      vdoEmbed.appendChild(vdoSrc)
      cardBody.appendChild(vdoEmbed);
    }
  }

  if (image.match(/bmp|webp|png|jpg|jpeg|gif$/)) {
    creaImage(cardBody, image)
  } else if (image.match(/gifv$/)) {
    const htmlWrap = document.createElement('div');
    htmlWrap.innerHTML = `<video draggable="false" playsinline autoplay loop class="w-100"><source type="video/mp4" src="${image.replace('gifv', 'mp4')}"></video>`
    cardBody.appendChild(htmlWrap);

  }

  card.appendChild(cardBody);
  root.appendChild(card);

  card.animate([
    { opacity: '0', transform: 'translate3d(0, 100%, 0)' },
    { opacity: '1', transform: 'translate3d(0, 0, 0)' }
  ], {
    // timing options
    duration: 1000,
    iterations: 1
  })
}

const creaImage = (el, image) => {
  const picture = document.createElement('picture');
  const source = document.createElement('source');
  const img = document.createElement('img');

  img.style.maxHeight = '512px';

  source.srcset = image;
  source.type = 'image/svg+xml'

  img.className = 'img-fluid rounded mx-auto d-block';
  img.src = image;

  picture.appendChild(source);
  picture.appendChild(img);
  el.appendChild(picture);
}

const escapeHTML = (string) => {
  var e = document.createElement('textarea');
  e.innerHTML = string;
  // handle case of empty input
  return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
}

r(root)
