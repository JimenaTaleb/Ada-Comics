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

let resorurce = "comics" || "characters";
let limit = 20;
let title = "";
let characterName = "";
let offset = 0;
const resultsPerPage = 20;
let currentPage = 1;
let totalPages = 1;


//Ocultar elementos
const hideElement = (selectors) => {
    for (const selector of selectors) {
      $(selector).classList.add("hidden");
    }
  };

//Mostrar elementos
const showElement = (selectors) => {
    for (const selector of selectors) {
      $(selector).classList.remove("hidden");
    }
  };  

//Llamado a la api
const getDataApi = async (resourceSearch, inputSearch, orderSearch, limitParam, offsetParam, renderFunction) => {
    let urlApi = `${baseURL}`;

    if (resourceSearch === "comics") {
        if (inputSearch) {
            urlApi += `comics?titleStartsWith=${inputSearch}&`;
        } else {
            urlApi += `comics?`;
        }

        if (orderSearch === "A-Z") {
            urlApi += `orderBy=title&`;
        } else if (orderSearch === "Z-A") {
            urlApi += `orderBy=-title&`;
        } else if (orderSearch === "Más nuevos") {
            urlApi += `orderBy=-focDate&`;
        } else if (orderSearch === "Más viejos") {
            urlApi += `orderBy=focDate&`;
        }

        urlApi += `offset=${offsetParam}&limit=${limitParam}&${ts}${publicKey}&${hash}`;
    } else if (resourceSearch === "characters") {
        if (inputSearch) {
            urlApi += `characters?nameStartsWith=${inputSearch}&`;
        } else {
            urlApi += `characters?`;
        }

        if (orderSearch === "A-Z") {
            urlApi += `&orderBy=name&`;
        } else if (orderSearch === "Z-A") {
            urlApi += `&orderBy=-name&`;
        }

        urlApi += `&offset=${offsetParam}&limit=${limitParam}&${ts}${publicKey}&${hash}`;
    }

    const response = await fetch(urlApi);
    console.log(urlApi);
    const data = await response.json();

    if (renderFunction) {
        renderFunction(data.data.results);
      }

      currentPage = Math.ceil((offsetParam + 1) / resultsPerPage);
      totalPages = Math.ceil(data.data.total / resultsPerPage);  

      
    console.log(data);
    return data
};

//Render
const renderCharacterCard = (result) => {
    const imageUrl = `${result.thumbnail.path}.${result.thumbnail.extension}`;
    const cardContainer = document.createElement("div");
    
    cardContainer.classList.add(result.hasOwnProperty("title") ? "comic-card" : "character-card");

    const imageElement = document.createElement("img");
    imageElement.alt = result.title || result.name;
    imageElement.src = imageUrl;

    const titleElement = document.createElement("h2");
    titleElement.textContent = result.title || result.name;

    cardContainer.appendChild(imageElement);
    cardContainer.appendChild(titleElement);

    return cardContainer;
};


//Render con get
const renderFunction = (results) => {
    const cardContainer = $("#card--container");
    cardContainer.innerHTML = "";
  
    for (let result of results) {
      const characterCard = renderCharacterCard(result);
      cardContainer.appendChild(characterCard);
    }
  };

//Total de resultados  
const getTotalResults = async (resourceSearch, inputSearch, orderSearch) => {
    const maxLimit = 100;
    const offsetParam = 0;
  
    const data = await getDataApi(resourceSearch, inputSearch, orderSearch, maxLimit, offsetParam);
    const totalResults = data.data.total;
  
    return totalResults;
  };

//Render resultados  
const renderTotalResults = async (resourceSearch, inputSearch, orderSearch) => {
    const totalResults = await getTotalResults(resourceSearch, inputSearch, orderSearch);
  
    const resultsQuantity = $("#results--cuantiti");
    resultsQuantity.textContent = `RESULTADOS: ${totalResults}`;
  };  



// ...

// Ir a la siguiente pagina
const loadMoreResults = async () => {
  if (currentPage < totalPages) {
      offset++
      await getDataApi(resorurce, title, characterName, limit, offset, renderFunction);
  }
};


// Ir a la pagina anterior
const loadLessResults = async () => {
  if (currentPage >= 1) {
      offset--
      await getDataApi(resorurce, title, characterName, limit, offset, renderFunction);
  }
};

  





//Initialize
document.addEventListener("DOMContentLoaded", async () => {
    await getDataApi("comics", "", "A-Z", 20, 0, renderFunction);
    await renderTotalResults("comics", "", "A-Z");

//Mostrar
$("#search--type").addEventListener("change", () =>{
        hideElement(["#sort--title-atoz", "#sort--title-ztoa", "#sort--title-new", "#sort--title-old"])
        showElement(["#sort--character-atoz", "#sort--character-ztoa"])
})

// Evento buscar
$("#btn--search").addEventListener("click", async () => {
    const searchTerm = $("#input--search").value;
    const typeSelected = $("#search--type").value;
    const searchSort = $("#search--sort").value;
  

    await getDataApi(typeSelected, searchTerm, searchSort, 20, 0, renderFunction);
    await renderTotalResults(typeSelected, searchTerm, searchSort);
  });
  

  $("#btn--prev-page").addEventListener("click", loadLessResults);
  $("#btn--next-page").addEventListener("click", loadMoreResults);

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









