//Selector
const $ = (selector) => document.querySelector(selector);

//Variables globales

//URL base
const baseURL = "https://gateway.marvel.com/v1/public/"

let urlAPI = ""

//TS
let ts = "ts=1"

//Public key
const publicKey = "&apikey=50ff4b6413283116c5c77b0bf9a1e88d"

//Hash md5
const hash = "&hash=adf5b63cea12d70814987f448a7b08e5" 

let resource = "comics" || "characters";
let limit = 20;
let title = "";
let characterName = "";
let offset = 0;
const resultsPerPage = 20;
let currentPage = 1
let totalPages = 1;


//Ocultar elementos
const hideElement = (selectors) => {
  for (const selector of selectors) {
    const element = $(selector);
    if (element) {
      element.style.display = "none";
    }
  }
};

//Mostrar elementos
const showElement = (selectors) => {
  for (const selector of selectors) {
    const element = $(selector);
    if (element) {
      element.style.display = "block";
    }
  }
};

//Construcción de la url
const buildApiUrl = (resource, inputSearch, orderSearch, offsetParam, limitParam) => {
  let url = `${baseURL}${resource}?`;

  if (inputSearch) {
      url += `${resource === 'comics' ? 'titleStartsWith' : 'nameStartsWith'}=${inputSearch}&`;
  }

  switch (orderSearch.toLowerCase()) {
      case "a-z":
          url += `orderBy=${resource === 'comics' ? 'title' : 'name'}&`;
          break;
      case "z-a":
          url += `orderBy=-${resource === 'comics' ? 'title' : 'name'}&`;
          break;
      case "-focDate":
          if (resource === 'comics') {
              url += 'orderBy=-focDate&';
          }
          break;
      case "focDate":
          if (resource === 'comics') {
              url += 'orderBy=focDate&';
          }
          break;
  }

  url += `offset=${offsetParam}&limit=${limitParam}&${ts}${publicKey}&${hash}`;
  return url;
};

//Fetch a la Api
const fetchData = async (url) => {
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

//Llamado a la API
const getDataApi = async (resourceSearch, inputSearch, orderSearch, limitParam, offsetParam) => {
  const urlApi = buildApiUrl(resourceSearch, inputSearch, orderSearch, offsetParam, limitParam);
  const data = await fetchData(urlApi);
  return data;
};


// Render Api results
const renderApiResults = async (resourceSearch, inputSearch, orderSearch, limitParam, offsetParam) => {
  const results = await getDataApi(resourceSearch, inputSearch, orderSearch, limitParam, offsetParam);
  $("#card--container").innerHTML = "";

  for (const result of results.data.results) {
    if (resourceSearch === "comics") {
      const imageUrlComic = `${result.thumbnail.path}.${result.thumbnail.extension}`;
      const id = result.id;
      const title = result.title;
      const releaseDate = result.dates.find(date => date.type === "onsaleDate").date;
      const writers = result.creators.items.filter(creator => creator.role === "writer").map(writer => writer.name);
      const description = result.description;
      const characters = result.characters.items.map(character => character.name);

      const comicCard = document.createElement("div");
      comicCard.className = "comic-card";
      comicCard.id = id;
      comicCard.innerHTML = `
        <img src="${imageUrlComic}">
        <h2>${title}</h2>
      `;

      comicCard.addEventListener("click", () => {
        showComicDetails(imageUrlComic, title, releaseDate, writers.join(", "), description, characters.join(", "));
      });

      $("#card--container").appendChild(comicCard);
    } else if (resourceSearch === "characters") {
      const imageUrlCharacter = `${result.thumbnail.path}.${result.thumbnail.extension}`;
      const id = result.id;
      const name = result.name;
      const description = result.description;
      const characterCard = document.createElement("div");
      characterCard.className = "character-card";
      characterCard.id = id;
      characterCard.innerHTML = `
        <img src="${imageUrlCharacter}">
        <h2>${name}</h2>
      `;

      characterCard.addEventListener("click", () => {
        showCharacterDetails(imageUrlCharacter, name, description);
      });

      $("#card--container").appendChild(characterCard);
    }
  }
};

// Format date
const formatReleaseDate = (dateString) => {
  const options = { day: "2-digit", month: "2-digit", year: "numeric" };
  const formattedDate = new Date(dateString).toLocaleDateString(undefined, options);
  return formattedDate;
};

// Función para mostrar detalles de cómic
const showComicDetails = async (imageUrl, title, releaseDate, writers, description) => {
  hideElement(["#card--container", "#results--container"]);
  showElement(["#card--details"]);

  const formattedReleaseDate = formatReleaseDate(releaseDate);

  $("#card--details").innerHTML = `
    <img src="${imageUrl}" alt="${title}">
    <h2>${title}</h2>
    <p class="date">Fecha de lanzamiento: <span>${formattedReleaseDate}</span></p>
    <p class="writers">Guionistas: <span>${writers || "Sin datos disponibles"}</span></p>
    <p class="description">Descripción: <span>${description || "Sin descripción disponible"}</span></p>
    <div id="characters-section"></div>
    <button id="btn--goBack" onclick="hideElement(['#card--details']); showElement(['#card--container'])"> Volver </button>
  `;
};


//Total de resultados  
const getTotalResults = async (resourceSearch, inputSearch, orderSearch, limitParam, offsetParam) => {
  const data = await getDataApi(resourceSearch, inputSearch, orderSearch, limitParam, offsetParam);
  totalPages = Math.ceil(data.data.total / resultsPerPage);
  const currentPage = Math.floor(offsetParam / resultsPerPage) + 1;

  return { totalResults: data.data.total, totalPages, currentPage };
};

//Render resultados  
const renderTotalResults = async (resourceSearch, inputSearch, orderSearch, limitParam, offsetParam) => {
    const pagination = await getTotalResults(resourceSearch, inputSearch, orderSearch, limitParam, offsetParam);
  
    $("#results--cuantiti").textContent = `RESULTADOS: ${pagination.totalResults}`;
    $("#current--page").textContent = `PÁGINA ACTUAL: ${pagination.currentPage}`;
    $("#total--pages").textContent = `PÁGINAS TOTALES: ${pagination.totalPages}`;
  };

//Update disabled
const updateDisabledProperty = () => {
  const currentPage = Math.floor(offset / resultsPerPage) + 1;

  if (offset > 0) {
    $("#btn--prev-page").disabled = false;
    $("#btn--first-page").disabled = false;
  } else {
    $("#btn--prev-page").disabled = true;
    $("#btn--first-page").disabled = true;
  }

  if (offset < (totalPages - 1) * resultsPerPage) {
    $("#btn--next-page").disabled = false;
    $("#btn--last-page").disabled = false;
  } else {
    $("#btn--next-page").disabled = true;
    $("#btn--last-page").disabled = true;
  }
};


//Initialize
document.addEventListener("DOMContentLoaded", async () => {
    await renderApiResults("comics", "", "a-z",  20, 0);
    await renderTotalResults("comics", "", "a-z",  20, 0)
    updateDisabledProperty()
})


//Search
$("#btn--search").addEventListener("click", async () => {
  offset = 0
  const typeSelected = $("#search--type").value;
  const searchTerm = $("#input--search").value;
  const searchSort = $("#search--sort").value;

  await getDataApi(typeSelected, searchTerm, searchSort, limit, offset);
  await renderApiResults(typeSelected, searchTerm, searchSort, limit, offset)
  await renderTotalResults(typeSelected, searchTerm, searchSort, limit, offset)
  
 
})

//Btn next page
$("#btn--next-page").addEventListener("click", async () => {

  $("#card--container").innerHTML = "";

  if (currentPage <= 1) {
    offset += 20
    updateDisabledProperty()
  } 

  const typeSelected = $("#search--type").value;
  const searchTerm = $("#input--search").value;
  const searchSort = $("#search--sort").value;
  
  await getDataApi(typeSelected, searchTerm, searchSort, limit, offset);
  await renderApiResults(typeSelected, searchTerm, searchSort, limit, offset)
  await renderTotalResults(typeSelected, searchTerm, searchSort, limit, offset)
});


// Btn prev page
$("#btn--prev-page").addEventListener("click", async () => {
  if (currentPage > 1  && currentPage <= totalPages) {
    offset -= 20
    updateDisabledProperty()
  } 

  const typeSelected = $("#search--type").value;
  const searchTerm = $("#input--search").value;
  const searchSort = $("#search--sort").value;
  
  await getDataApi(typeSelected, searchTerm, searchSort, limit, offset);
  await renderTotalResults(typeSelected, searchTerm, searchSort, limit, offset)
  await renderApiResults(typeSelected, searchTerm, searchSort, limit, offset)
  
});

//Btn go to first page
$("#btn--first-page").addEventListener("click", async () => {
  offset = 0;
  updateDisabledProperty()

  const typeSelected = $("#search--type").value;
  const searchTerm = $("#input--search").value;
  const searchSort = $("#search--sort").value;

  await getDataApi(typeSelected, searchTerm, searchSort, limit, offset);
  await renderApiResults(typeSelected, searchTerm, searchSort, limit, offset);
  await renderTotalResults(typeSelected, searchTerm, searchSort, limit, offset);

});

// Btn go to last page
$("#btn--last-page").addEventListener("click", async () => {
  const typeSelected = $("#search--type").value;
  const searchTerm = $("#input--search").value;
  const searchSort = $("#search--sort").value;

  const { totalPages } = await getTotalResults(typeSelected, searchTerm, searchSort, limit, offset);

  if (totalPages > 0) {
    offset = (totalPages - 1) * resultsPerPage;
    updateDisabledProperty()
    await getDataApi(typeSelected, searchTerm, searchSort, limit, offset);
    await renderApiResults(typeSelected, searchTerm, searchSort, limit, offset);
    await renderTotalResults(typeSelected, searchTerm, searchSort, limit, offset);
  }
});




// Btn go to selected page
$("#btn--gotopage").addEventListener("click", async () => {
  const typeSelected = $("#search--type").value;
  const searchTerm = $("#input--search").value;
  const searchSort = $("#search--sort").value;

  const selectedPage = $("#page--input").valueAsNumber;

  const { totalPages } = await getTotalResults(typeSelected, searchTerm, searchSort, limit, offset);

  if (selectedPage > 0 && selectedPage <= totalPages) {
    offset = (selectedPage - 1) * resultsPerPage;
    await getDataApi(typeSelected, searchTerm, searchSort, limit, offset);
    await renderApiResults(typeSelected, searchTerm, searchSort, limit, offset);
    await renderTotalResults(typeSelected, searchTerm, searchSort, limit, offset);
  } else {
    alert("Número de página inválido");
  }
  $("#page--input").value = "";
});

//Ocultar
$("#search--type").addEventListener("change", () =>{
  if($("#search--type").value === "characters"){
    hideElement(["#sort--title-new", "#sort--title-old"])
  } else{
    showElement(["#a-z", "#z-a", "#sort--title-new", "#sort--title-old"])
  }
})





