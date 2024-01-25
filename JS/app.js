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

//Llamado a la api
const getDataApi = async (resourceSearch, inputSearch, orderSearch, limitParam, offsetParam) => {
  console.log("orderSearch:", orderSearch);

    let urlApi = `${baseURL}`;

    if (resourceSearch === "comics") {
        if (inputSearch) {
            urlApi += `comics?titleStartsWith=${inputSearch}&`;
            console.log(urlApi);
        } else {
            urlApi += `comics?`;
            console.log(urlApi);
        }

        if (orderSearch.toLowerCase() === "a-z") {
          console.log("Orden A-Z para comics");
          urlApi += `orderBy=title&`;
          console.log(urlApi);
      } else if (orderSearch.toLowerCase() === "z-a") {
          console.log("Orden Z-A para comics");
          urlApi += `orderBy=-title&`;
          console.log(urlApi);
      } else if (orderSearch === "-focDate") {
          console.log("Orden Más Nuevos para comics");
          urlApi += `orderBy=-focDate&`;
          console.log(urlApi);
      } else if (orderSearch === "focDate") {
          console.log("Orden Más Viejos para comics");
          urlApi += `orderBy=focDate&`;
          console.log(urlApi);
      }

        console.log(`el orden es para comics: ${orderSearch}`);
        console.log(urlApi);

        urlApi += `offset=${offsetParam}&limit=${limitParam}&${ts}${publicKey}&${hash}`;
    } else if (resourceSearch === "characters") {
        if (inputSearch) {
            urlApi += `characters?nameStartsWith=${inputSearch}&`;
        } else {
            urlApi += `characters?`;
        }

        if (orderSearch === "a-z") {
            urlApi += `&orderBy=name&`;
        } else if (orderSearch === "z-a") {
            urlApi += `&orderBy=-name&`;
        }

        console.log(`el orden es para personajes: ${orderSearch}`);
        console.log(urlApi);

        urlApi += `&offset=${offsetParam}&limit=${limitParam}&${ts}${publicKey}&${hash}`;
    }

    const response = await fetch(urlApi);
    console.log(urlApi);
    const data = await response.json();

    console.log(data);
    return data
};

const renderApiResults = async (resourceSearch, inputSearch, orderSearch, limitParam, offsetParam) => {
  const results = await getDataApi(resourceSearch, inputSearch, orderSearch, limitParam, offsetParam);
  $("#card--container").innerHTML = "";
  
  for (const result of results.data.results) {
    if (resourceSearch === "comics") {
      const imageUrl = `${result.thumbnail.path}.${result.thumbnail.extension}`;
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
        <img src="${imageUrl}">
        <h2>${title}</h2>
      `;

      comicCard.addEventListener("click", () => {
        showDetails("comics", imageUrl, title, releaseDate, writers.join(", "), description, characters.join(", "));
      });

      $("#card--container").appendChild(comicCard);
    } else if (resourceSearch === "characters") {
      const imageUrl = `${result.thumbnail.path}.${result.thumbnail.extension}`;
      const id = result.id;
      const name = result.name;
      const description = result.description;

      $("#card--container").innerHTML += `
        <div class="character-card" id="${id}" onclick="showDetails("characters", "${imageUrl}", "${name}", "${description}")">
          <img src="${imageUrl}">
          <h2>${name}</h2>
        </div>
      `;
    }
  }
};


const showDetails = (type, imageUrl, title, releaseDate, writers, description, characters) => {
  hideElement(["#card--container"]);
  showElement(["#card--details"]);

  $("#card--details").innerHTML = `
    <img src="${imageUrl}" alt="${title}">
    <h2>${title}</h2>
    <p>Fecha de lanzamiento: ${releaseDate}</p>
    ${type === "comics" ? `<p>Guionistas: ${writers}</p>` : ""}
    <p>Descripción: ${description}</p>
    ${type === "comics" ? `<p>Personajes incluidos: ${characters}</p>` : ""}
    <button id="btn--goBack" onclick="hideElement(["#card--details"]); showElement(["#card--container"])"> Volver </button>
  `;
};



//Total de resultados  
const getTotalResults = async (resourceSearch, inputSearch, orderSearch, limitParam, offsetParam) => {
  
    const data = await getDataApi(resourceSearch, inputSearch, orderSearch, limitParam, offsetParam);
    const totalResults = data.data.total;
    const totalPages = Math.ceil(data.data.total / resultsPerPage); 
    const currentPage = offsetParam + 1

    return {totalResults, totalPages, currentPage}
  };

//Render resultados  
const renderTotalResults = async (resourceSearch, inputSearch, orderSearch, limitParam, offsetParam) => {
    const pagination = await getTotalResults(resourceSearch, inputSearch, orderSearch, limitParam, offsetParam);
  
    $("#results--cuantiti").textContent = `RESULTADOS: ${pagination.totalResults}`;
    $("#current--page").textContent = `PÁGINA ACTUAL: ${pagination.currentPage}`;
    $("#total--pages").textContent = `PÁGINAS TOTALES: ${pagination.totalPages}`;
  };
  

//Initialize
document.addEventListener("DOMContentLoaded", async () => {
    await renderApiResults("comics", "", "a-z",  20, 0);
    await renderTotalResults("comics", "", "a-z",  20, 0)

})


//Search
$("#btn--search").addEventListener("click", async () => {
  offset = 0
  const typeSelected = $("#search--type").value;
  const searchTerm = $("#input--search").value;
  const searchSort = $("#search--sort").value;
  console.log(typeSelected);
  console.log(searchTerm);
  console.log(searchSort);


  await getDataApi(typeSelected, searchTerm, searchSort, limit, offset);
  await renderApiResults(typeSelected, searchTerm, searchSort, limit, offset)
  await renderTotalResults(typeSelected, searchTerm, searchSort, limit, offset)
 
})

//Btn next page
$("#btn--next-page").addEventListener("click", async () => {

  $("#card--container").innerHTML = "";

  if (currentPage <= 1) {
    offset += 20
    console.log(offset);
  }

  const typeSelected = $("#search--type").value;
  const searchTerm = $("#input--search").value;
  const searchSort = $("#search--sort").value;
  console.log((searchSort));
  
  await getDataApi(typeSelected, searchTerm, searchSort, limit, offset);
  await renderApiResults(typeSelected, searchTerm, searchSort, limit, offset)
  await renderTotalResults(typeSelected, searchTerm, searchSort, limit, offset)
});


// Btn prev page
$("#btn--prev-page").addEventListener("click", async () => {
  if (currentPage >= 1) {
    offset -= 20
    console.log(offset);
  }

  const typeSelected = $("#search--type").value;
  const searchTerm = $("#input--search").value;
  const searchSort = $("#search--sort").value;
  console.log((searchSort));
  
  await getDataApi(typeSelected, searchTerm, searchSort, limit, offset);
  await renderTotalResults(typeSelected, searchTerm, searchSort, limit, offset)
  await renderApiResults(typeSelected, searchTerm, searchSort, limit, offset)
  
});

//Btn go to first page
$("#btn--first-page").addEventListener("click", async () => {
  offset = 0;

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

  const data = await getTotalResults(typeSelected, searchTerm, searchSort, limit, offset);
  const lastPage = data.totalPages;
  offset = lastPage - 1;

  await getDataApi(typeSelected, searchTerm, searchSort, limit, offset);
  await renderApiResults(typeSelected, searchTerm, searchSort, limit, offset);
  await renderTotalResults(typeSelected, searchTerm, searchSort, limit, offset);
});



// Btn go to selected page
$("#btn--gotopage").addEventListener("click", async () => {
  const typeSelected = $("#search--type").value;
  const searchTerm = $("#input--search").value;
  const searchSort = $("#search--sort").value;

  const selectedPage = $("#page--input").valueAsNumber;

  const { totalPages } = await getTotalResults(typeSelected, searchTerm, searchSort, limit, offset);

  if (selectedPage > 0 && selectedPage <= totalPages) {
    offset = selectedPage - 1
    await getDataApi(typeSelected, searchTerm, searchSort, limit, offset);
    await renderApiResults(typeSelected, searchTerm, searchSort, limit, offset);
    await renderTotalResults(typeSelected, searchTerm, searchSort, limit, offset);
  } else {
    alert("Número de página inválido");
  }
  $("#page--input").value = ""
});


//API FETCH
// const apiFetch = async (urlAPI) =>{
//     console.log(urlAPI);
//     const response = await fetch(urlAPI);
//     const data = await response.json();
//     console.log(data.data.results);
//     return data.data.results
// }



//API constructor
// const urlBuilding = (resorurce) =>{
//     let urlAPI = `${baseURL}${resorurce}?${ts}${publicKey}${hash}`
//     return urlAPI
// }
// apiFetch(urlBuilding("comics"))

// const buildingSearchParams = () => {

// };




