import axios from 'axios';

export default class Recipe {
    constructor(id){
        this.id = id;
    }
    async getRecipe (){
        try {
        const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
        this.title = res.data.recipe.title;
        this.author = res.data.recipe.publisher;
        this.img = res.data.recipe.image_url;
        this.ingredients = res.data.recipe.ingredients;
        this.url = res.data.recipe.source_url;
        
        } catch (error){
            alert(error)
        }
        
    };

    calcTime() {
        // Estimating time to prepare
        const numOfIng = this.ingredients.length;
        const period = Math.ceil(numOfIng / 3);
        this.time = period * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {

        const longUnits= ['tablespoons', 'tablespoon', 'teaspoons', 'teaspoon', 'ounces', 'ounce',  'cups', 'pounds'];
        const shortUnits = ['tbsp', 'tbsp', 'tsp', 'tsp', 'oz', 'oz', 'cup', 'pound'];
        const units = [...shortUnits, 'kg', 'g'];
        // To get uniform units
        const newIngredients = this.ingredients.map( el => {
            let ingredient = el.toLowerCase();
            longUnits.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, shortUnits[i]);
            });

            // Remove Parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

            // Parse Ingredients

            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el2 => units.includes(el2));

            let objIng;
            if (unitIndex > -1){
                // There is a Unit
                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if (arrCount.length === 1){
                    count = eval(arrIng[0].replace('-', '+'));
                }
                else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ') 
                }
            }
            else if (parseInt(arrIng[0], 10)){
                // There is no Unit and first elememt is a number
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            }
            else if (unitIndex === -1){
                // There is no Unit and no Number
                objIng = {
                    count: 1,
                    unit: '',
                    ingredient
                }
            }

                return objIng;
        });

        this.ingredients = newIngredients;
       
    }

    updateServings (type) {
        // Update servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1;

        // Update Ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings) ;
        })

        this.servings = newServings;

    }
   
};