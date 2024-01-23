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
let currentPage = offset + 1;
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

        if (orderSearch.toLowerCase() === "title") {
          console.log("Orden A-Z para comics");
          urlApi += `orderBy=title&`;
          console.log(urlApi);
      } else if (orderSearch.toLowerCase() === "-title") {
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

        if (orderSearch === "name") {
            urlApi += `&orderBy=name&`;
        } else if (orderSearch === "-name") {
            urlApi += `&orderBy=-name&`;
        }

        console.log(`el orden es para personajes: ${orderSearch}`);
        console.log(urlApi);

        urlApi += `&offset=${offsetParam}&limit=${limitParam}&${ts}${publicKey}&${hash}`;
    }

    const response = await fetch(urlApi);
    console.log(urlApi);
    const data = await response.json();

    totalPages = Math.ceil(data.data.total / resultsPerPage);  

      
    console.log(data);
    return data
};

// Render results
const renderApiResults = async (resourceSearch, inputSearch, orderSearch, limitParam, offsetParam) => {
  const results = await getDataApi(resourceSearch, inputSearch, orderSearch, limitParam, offsetParam);
  $("#card--container").innerHTML = "";
  for (const result of results.data.results) {
    if (resourceSearch === "comics") {
      const imageUrl = `${result.thumbnail.path}.${result.thumbnail.extension}`;
      $("#card--container").innerHTML += `
        <div class="comic-card">
          <img src="${imageUrl}">
          <h2>${result.title}</h2>
        </div>
      `;
    } else if (resourceSearch === "characters") {
      const imageUrl = `${result.thumbnail.path}.${result.thumbnail.extension}`;
      $("#card--container").innerHTML += `
        <div class="character-card">
          <img src="${imageUrl}">
          <h2>${result.name}</h2>
        </div>
      `;
    }
  }
};


//Total de resultados  
// const getTotalResults = async (resourceSearch, inputSearch, orderSearch, limitParam, offsetParam) => {
  
//     const data = await getDataApi(resourceSearch, inputSearch, orderSearch, limitParam, offsetParam);
//     const totalResults = data.data.total;
  
//     return totalResults;
//   };

//Render resultados  
// const renderTotalResults = async (resourceSearch, inputSearch, orderSearch, limitParam, offsetParam) => {
//     const totalResults = await getTotalResults(resourceSearch, inputSearch, orderSearch, limitParam, offsetParam);
  
//     const resultsQuantity = $("#results--cuantiti");
//     resultsQuantity.textContent = `RESULTADOS: ${totalResults}`;
//   };  


// Ir a la siguiente pagina
// const loadMoreResults = async () => {
//   if (currentPage < totalPages) {
//       offset++
//       await getDataApi(resource, title, characterName, limit, offset, renderFunction);
//       console.log(offset)
//   }
// };


// Ir a la pagina anterior
// const loadLessResults = async () => {
//   if (currentPage >= 1) {
//       offset--
//       await getDataApi(resource, title, characterName, limit, offset, renderFunction);
//       console.log(offset)
//   }
// };

  





//Initialize
document.addEventListener("DOMContentLoaded", async () => {
    await getDataApi("comics", "", "title", 20, 0);
    await renderApiResults("comics", "", "title",  20, 0);

//Hide options
$("#search--type").addEventListener("change", () =>{
  if($("#search--type").value === "comics"){
    hideElement(["#sort--character-atoz", "#sort--character-ztoa"])
  } else if($("#search--type").value === "characters")
        hideElement(["#sort--title-atoz", "#sort--title-ztoa", "#sort--title-new", "#sort--title-old"])
        showElement(["#sort--character-atoz", "#sort--character-ztoa"])
})

//Search
$("#btn--search").addEventListener("click", async () => {
  const typeSelected = $("#search--type").value;
  const searchTerm = $("#input--search").value;
  const searchSort = $("#search--sort").value;


  await getDataApi(typeSelected, searchTerm, searchSort, limit, offset);
  await renderApiResults(typeSelected, searchTerm, searchSort, limit, offset)
 
})

  
})



  

  // $("#btn--prev-page").addEventListener("click", loadLessResults);
  // $("#btn--next-page").addEventListener("click", loadMoreResults);






  
  
  



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









