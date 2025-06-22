

// Check if the 'favouritesList' array exists in local storage, if not, create it
if (!localStorage.getItem("favouritesList")) {
    localStorage.setItem("favouritesList", JSON.stringify([]));
}


// Async function to fetch meals from the API based on the URL and value provided
async function fetchMealsFromApi(url, value) {
    const response = await fetch(`${url + value}`);
    const meals = await response.json();
    return meals;
}

// Function to fetch and populate category dropdown
async function fetchCategories() {
    let url = "https://www.themealdb.com/api/json/v1/1/categories.php";
    let response = await fetch(url);
    let data = await response.json();
    let dropdown = document.getElementById("category-dropdown");

    data.categories.forEach(category => {
        let option = document.createElement("option");
        option.value = category.strCategory;
        option.textContent = category.strCategory;
        dropdown.appendChild(option);
    });
}

// Function to fetch meal details by ID
async function fetchMealById(mealId) {
    let response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
    let data = await response.json();
    return data.meals ? data.meals[0] : null;
}


// Function to display meal list based on category
async function showMealList() {
    let category = document.getElementById("category-dropdown").value;
    let arr = JSON.parse(localStorage.getItem("favouritesList")) || [];
    let url = "https://www.themealdb.com/api/json/v1/1/filter.php?c=";
    let html = "";

    if (!category) {
        document.getElementById("main").innerHTML = "";
        return;
    }

    let data = await fetchMealsFromApi(url, category); // Await the API response

    if (data.meals) {
        data.meals.forEach((element) => {
            let isFav = arr.includes(element.idMeal);
            html += `
            <div id="card" class="card mb-3" style="width: 20rem;">
                <img src="${element.strMealThumb}" class="card-img-top" alt="...">
                <div class="card-body">
                    <h5 class="card-title">${element.strMeal}</h5>
                    <div class="d-flex justify-content-between mt-5">
                        <button type="button" class="btn btn-outline-light" onclick="showMealDetails(${element.idMeal})">More Details</button>
                        <button id="main${element.idMeal}" class="btn btn-outline-light ${isFav ? 'active' : ''}" onclick="addRemoveToFavList('${element.idMeal}')" style="border-radius:50%">
                            <i class="fa-solid fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        });
    } else {
        html = `<div class="text-center mt-3"><h5>No meals found for this category.</h5></div>`;
    }
    document.getElementById("main").innerHTML = html;
}

   

// Autocomplete suggestions for search bar
async function autocompleteSearch() {
    let input = document.getElementById("search-bar");
    let dropdown = document.getElementById("autocomplete-dropdown");
    let query = input.value;
    let selectedSearchType = document.getElementById("selectedSearchType").innerText;
    
    if (query.length < 2 || selectedSearchType === "Ingredient") {
        dropdown.innerHTML = "";
        return;
    }
    
    let url = "https://www.themealdb.com/api/json/v1/1/search.php?s=";
    let meals = await fetchMealsFromApi(url, query);
    
    dropdown.innerHTML = "";
    
    if (meals.meals) {
        meals.meals.slice(0, 5).forEach(meal => {
            let item = document.createElement("div");
            item.classList.add("autocomplete-item");
            item.innerText = meal.strMeal;
            item.onclick = () => {
                input.value = meal.strMeal;
                dropdown.innerHTML = "";
                showMealList();
            };
            dropdown.appendChild(item);
        });
    }
}

document.getElementById("search-bar").addEventListener("input", autocompleteSearch);

// Search by ingredient function
async function searchByIngredient(ingredient) {
    let url = "https://www.themealdb.com/api/json/v1/1/filter.php?i=";
    let meals = await fetchMealsFromApi(url, ingredient);
    let html = "";
    
    if (meals.meals) {
        meals.meals.forEach(meal => {
            html += `
            <div class="card mb-3" style="width: 20rem;">
                <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                <div class="card-body">
                    <h5 class="card-title">${meal.strMeal}</h5>
                    <button class="btn btn-danger" onclick="showMealDetails(${meal.idMeal})">More Details</button>
                </div>
            </div>`;
        });
    } else {
        html = `<div class="text-center mt-3"><h5>No meals found for this ingredient.</h5></div>`;
    }

    document.getElementById("main").innerHTML = html;
}



function sortMeals() {
    let sortOption = document.getElementById("sort-dropdown").value;
    let mealsContainer = document.getElementById("main");
    let mealCards = Array.from(mealsContainer.children);

    if (mealCards.length === 0) return; // No meals to sort

    mealCards.sort((a, b) => {
        if (sortOption === "popularity") {
            return Math.random() - 0.5; // Mocked popularity sorting (replace with real data if available)
        } else if (sortOption === "rating") {
            return Math.random() - 0.5; // Mocked rating sorting (replace with real data if available)
        } else if (sortOption === "time") {
            return Math.random() - 0.5; // Mocked time sorting (replace with real data if available)
        }
        return 0; // Default no sorting
    });

    mealsContainer.innerHTML = "";
    mealCards.forEach(card => mealsContainer.appendChild(card));
}

function setSearchType(type) {
    document.getElementById("selectedSearchType").innerText = type;

    // Get references to the input and dropdown
    let searchInput = document.getElementById("search-bar");
    let categoryDropdown = document.getElementById("category-dropdown");

    // Show/hide elements based on the selected type
    if (type === "Category") {
        searchInput.style.display = "none";
        categoryDropdown.style.display = "block";
    } else {
        searchInput.style.display = "block";
        categoryDropdown.style.display = "none";
    }
}

function performSearch() {
    let searchType = document.getElementById("selectedSearchType").innerText;
    let query = document.getElementById("search-bar").value.trim();
    
    if (!query) {
        alert("Please enter a search query!");
        return;
    }

    if (searchType === "Meal Name") {
        fetchMealsFromApi("https://www.themealdb.com/api/json/v1/1/search.php?s=", query)
            .then(displayMeals);
    } else if (searchType === "Ingredient") {
        fetchMealsFromApi("https://www.themealdb.com/api/json/v1/1/filter.php?i=", query)
            .then(displayMeals);
    } else {
        alert("Please select a valid search type.");
    }
}

// Function to display meals in the main container
function displayMeals(data) {
    let mainContainer = document.getElementById("main");
    mainContainer.innerHTML = "";
    let favList = JSON.parse(localStorage.getItem("favouritesList")) || [];

    if (data.meals) {
        data.meals.forEach(meal => {
            let isFav = favList.includes(meal.idMeal);
            mainContainer.innerHTML += `
                <div class="card mb-3" style="width: 20rem;">
                    <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
                    <div class="card-body">
                        <h5 class="card-title">${meal.strMeal}</h5>
                        <div class="d-flex justify-content-between mt-3">
                            <button class="btn btn-danger" onclick="showMealDetails(${meal.idMeal})">
                                More Details
                            </button>
                            <button id="main${meal.idMeal}" class="btn btn-outline-light ${isFav ? 'active' : ''}" onclick="addRemoveToFavList(${meal.idMeal})" style="border-radius:50%">
                                <i class="fa-solid fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
        });
    } else {
        mainContainer.innerHTML = `<div class="text-center mt-3"><h5>No meals found.</h5></div>`;
    }
}

async function showMealDetails(mealId) {
    let url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`;
    let response = await fetch(url);
    let data = await response.json();

    // console.log("Meal Data:", data); // Debugging: Check if meal details are received

    if (data.meals) {
        let meal = data.meals[0];

        // Select modal container and update content instead of appending new modal
        let modalContainer = document.getElementById("mealModalContainer");
        if (!modalContainer) {
            modalContainer = document.createElement("div");
            modalContainer.id = "mealModalContainer";
            document.body.appendChild(modalContainer);
        }

        modalContainer.innerHTML = `
            <div class="modal fade" id="mealModal" tabindex="-1" aria-labelledby="mealModalLabel" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="mealModalLabel">${meal.strMeal}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <img src="${meal.strMealThumb}" class="img-fluid mb-3" alt="${meal.strMeal}">
                            <p><strong>Category:</strong> ${meal.strCategory}</p>
                            <p><strong>Area:</strong> ${meal.strArea}</p>
                            <p><strong>Instructions:</strong> ${meal.strInstructions}</p>
                            <a href="${meal.strYoutube}" target="_blank" class="btn btn-primary">Watch on YouTube</a>
                        </div>
                    </div>
                </div>
            </div>`;

        let modal = new bootstrap.Modal(document.getElementById("mealModal"));
        modal.show();
    } else {
        alert("Meal details not found!");
    }
}

// Function to show all favourite meals in the favourites body

async function showFavMealList() {
    // Get the favourites list from local storage
    let arr = JSON.parse(localStorage.getItem("favouritesList"));
    // Define the URL for fetching meal details from the API
    let url = "https://www.themealdb.com/api/json/v1/1/lookup.php?i=";
    // Initialize an empty HTML string to store the favourite meal cards
    let html = "";
    // Check if the favourites list is empty
    if (arr.length == 0) {
        // Display a message if no favourite meals are found
        html += `
            <div class="page-wrap d-flex flex-row align-items-center">
                <div class="container">
                    <div class="row justify-content-center">
                        <div class="col-md-12 text-center">
                            <span class="display-1 d-block">404</span>
                            <div class="mb-4 lead">
                                No meal added in your favourites list.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `;
    } else {
        // Iterate through each meal in the favourites list
        for (let index = 0; index < arr.length; index++) {
            // Fetch meal details from the API based on the meal ID in the favourites list
            await fetchMealsFromApi(url, arr[index]).then(data => {
                // Construct HTML for each favourite meal card
                html += `
                <div id="card" class="card mb-3" style="width: 20rem;">
                    <img src="${data.meals[0].strMealThumb}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${data.meals[0].strMeal}</h5>
                        <div class="d-flex justify-content-between mt-5">
                            <button type="button" class="btn btn-outline-light" onclick="showMealDetails(${data.meals[0].idMeal})">More Details</button>
                            <button id="main${data.meals[0].idMeal}" class="btn btn-outline-light active" onclick="addRemoveToFavList(${data.meals[0].idMeal})" style="border-radius:50%"><i class="fa-solid fa-heart"></i></button>
                        </div>
                    </div>
                </div>
                `;
            });
        }
    }
    // Update the favourites body's HTML with the generated favourite meal cards
    document.getElementById("favourites-body").innerHTML = html;
}

// Function to add or remove meals from the favourites list
function addRemoveToFavList(mealId) {
    // Get the favourites list from local storage
    let arr = JSON.parse(localStorage.getItem("favouritesList"));
    // Initialize a variable to check if the meal is already in the favourites list
    let contain = false;
    // Iterate through the favourites list to check if the meal ID is already present
    for (let index = 0; index < arr.length; index++) {
        if (mealId == arr[index]) {
            // Set contain to true if the meal ID is found in the favourites list
            contain = true;
        }
    }
    // Check if the meal is already in the favourites list
    if (contain) {
        // Remove the meal from the favourites list
        let number = arr.indexOf(mealId);
        arr.splice(number, 1);
        alert("Your meal removed from your favourites list");
    } else {
        // Add the meal to the favourites list
        arr.push(mealId);
        alert("Your meal added to your favourites list");
    }
    // Update the favourites list in local storage
    localStorage.setItem("favouritesList", JSON.stringify(arr));
    // Update the displayed meal lists
    showMealList();
    showFavMealList();
}
    
    document.addEventListener("DOMContentLoaded", () => {
        fetchCategories();
        showFavMealList(); // Load favorites on page load
        
        // // Ensure favorites update when the offcanvas opens
        // document.getElementById("offcanvasNavbar").addEventListener("show.bs.offcanvas", () => {
        //     console.log("showFavMealList() is being called!");
        //     showFavMealList();
        // });
    });

function updateSearchBar() {
        let searchType = document.getElementById("searchType").value;
        let searchInput = document.getElementById("searchInput");
    
        if (searchType === "category") {
            searchInput.placeholder = "Search by Category...";
        } else if (searchType === "meal") {
            searchInput.placeholder = "Search by Meal Name or Ingredient...";
        } 
        // else if (searchType === "ingredient") {
        //     searchInput.placeholder = "Search by Ingredient...";
        // }
    }
   
    document.getElementById("searchDropdown").addEventListener("click", function (event) {
    event.preventDefault(); // ⛔ Prevent page scroll
    showMealList();         // ✅ Trigger category search
});

 
