import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/ShoppingList';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { element, renderLoader, clearLoader } from './views/base';



/**Global sate of the app
 * 1. Search Object - all the data about the search
 * 2. Current Recipe Object
 * 3. Shopping list object
 * 4. liked recipes
 */
const state = {};

const searchControll = async () => {
    // 1. Get query from the view
    const query = searchView.getInput();

    if (query){
        // 2.New search object and add to state
        state.search = new Search(query);

        // 3. Prepare the UI for search results
        searchView.clearInput();
        searchView.clearSearchList();
        renderLoader(element.searchLoader);

        try {
         // 4. Search for recipes
        await state.search.getResults();
        // 5. render or display results to the UI
        clearLoader();
        searchView.displayResults(state.search.result);
        }catch (error){
            alert('something wrong with the search')
        }
    }

}
element.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    searchControll();
    });

element.searchButtons.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
 
    if (btn){
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearSearchList();
        searchView.displayResults(state.search.result, goToPage);
    }
});

// RECIPE CONTROLLER

const recipeControl = async () => {
    // Getting the id from the URL
    const id = window.location.hash.replace('#', '');

    if(id){
        // Prepare the UI for changes
        recipeView.clearRecipe();
        renderLoader(element.recipe);

        // Hightlight selected Recipe
        if (state.search) searchView.highlightSelected(id);

        // create a new recipe object
        state.recipe = new Recipe(id);


        try {
             // Get the recipe
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();

        // Calculate servings and time
        state.recipe.calcTime();
        state.recipe.calcServings();
        
        // Render recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
        }catch (error){
            alert("cannot render recipe")
        }
       
    }
};


['hashchange', 'load'].forEach(event => window.addEventListener(event, recipeControl));


// LIST CONTROLLER

const listControl = () => {
    // Craete New List if there is no list
    if (!state.list) state.list = new List();

    // Add the ingredients to the state and UI
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
};

// LIKE CONTROL
// TESTING


const likeControl = () => {

    // Add new like if there none
    if (!state.likes) state.likes = new Likes();

    const currentID = state.recipe.id;
    if (!state.likes.isLiked(currentID)){
        // Add like to the state
        const newLike = state.likes.addLikes(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like to the UI
       likesView.renderLike(newLike);

    }else {
         // Remove like from the state
         state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);


        // Remove like from the UI
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//  Restore liked recipes on reload

window.addEventListener("load", () => {

    state.likes = new Likes();
    // Restore likes
    state.likes.getData();
    // Toggle the button
    likesView.toggleLikeMenu(state.likes.getNumLikes());
    // Render the exsisting likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handle Delete 
element.shoppingList.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    if (e.target.matches(".shopping__delete, .shopping__delete *")){
        // delete from state
        state.list.deleteItem(id);

        // delete from UI
        listView.deleteItem(id);
    }else if (e.target.matches('.shopping__count--value')){
        // Update Count
            const val = parseFloat(e.target.value, 10);
            state.list.updateCount(id, val)
        
    }
});

// Increase and decrease buttons
element.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')){
        // Decrease
        if (state.recipe.servings > 1){
            state.recipe.updateServings('dec');
            recipeView.updateServIng(state.recipe);
        }
        
    }else if (e.target.matches('.btn-increase, .btn-increase *')){
        // Increase
        state.recipe.updateServings('inc');
        recipeView.updateServIng(state.recipe);
        // adding ingredients to shopping list
    }else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
        listControl();

    }else if (e.target.matches('.recipe__love, .recipe__love *')){
        likeControl();
    }
});






