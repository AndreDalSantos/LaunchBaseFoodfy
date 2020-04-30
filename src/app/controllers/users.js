const { date } = require('../../lib/utils')
const User = require('../models/User')

module.exports = {
    init(req, res){

        let { filter, page, limit } = req.query

        page = page || 1
        limit = limit || 6
        let offset = limit * (page - 1)

        const params = {
            filter,
            page,
            limit,
            offset,
            callback(recipes) {

                if(recipes[0]){
                    const pagination = {
                        total: Math.ceil(recipes[0].total / limit),
                        page
                    }

                    User.chefsSelectOptions(function(options){
                        
                        return res.render('users/home', { recipes, pagination, filter, chefs: options })

                    })
                    
                } else {
                    return res.render('users/home') //trocar por not-found
                }

            }
        }

        User.paginate(params)
    },
    allRecipes(req, res){

        let { filter, page, limit } = req.query

        page = page || 1
        limit = limit || 6
        let offset = limit * (page - 1)

        const params = {
            filter,
            page,
            limit,
            offset,
            callback(recipes) {

                if(recipes[0]){
                    const pagination = {
                        total: Math.ceil(recipes[0].total / limit),
                        page
                    }

                    User.chefsSelectOptions(function(options){
                        
                        return res.render('users/receitas', { recipes, pagination, filter, chefs: options })

                    })

                } else {
                    return res.render('users/receitas') //trocar por not-found
                }

            }
        }

        User.paginate(params)

        //return res.render('users/receitas', {items: recipes})
        //return res.render('users/receitas')
        // return res.render('users/receitas', { items: data.recipes }) //
    },
    showRecipes(req, res){

        User.find(req.params.id, function(recipe){
            if(!recipe) return res.send('recipe not found')

            recipe.created_at = date(recipe.created_at).format

            User.chefsSelectOptions(function(options){
                        
                return res.render('users/view_recipe', { recipeClicked: recipe, chefs: options })

            })
        })

// const { id } = req.params

    // const foundRecipe = data.recipes.find(function(recipe) {
    //     return recipe.id == id
    // })

    // if(!foundRecipe) return res.send('Recipe not found!')

    // const recipe = {
    //     ...foundRecipe
    // }

    //return res.send('users/view_recipe - só uma')
    // return res.render("users/view_recipe")
    // return res.render("users/view_recipe", { recipeClicked: recipe }) 
    },
    about(req, res){
        return res.render('users/sobre')
    }
}