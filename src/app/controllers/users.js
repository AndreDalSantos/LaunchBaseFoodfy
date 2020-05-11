const { date } = require('../../lib/utils')
const User = require('../models/User')
const Recipe = require('../models/Recipe')

module.exports = {
    async init(req, res){

        // let { filter, page, limit } = req.query

        // page = page || 1
        // limit = limit || 6
        // let offset = limit * (page - 1)

        // const params = {
        //     filter,
        //     page,
        //     limit,
        //     offset,
        //     callback(recipes) {

        //         if(recipes[0]){
        //             const pagination = {
        //                 total: Math.ceil(recipes[0].total / limit),
        //                 page
        //             }

        //             User.chefsSelectOptions(function(options){
                        
        //                 return res.render('users/home', { recipes, pagination, filter, chefs: options })

        //             })
                    
        //         } else {
        //             return res.render('users/home') //trocar por not-found
        //         }

        //     }
        // }

        // User.paginate(params)

        try{
            let { filter, page, limit } = req.query

            page = page || 1
            limit = limit || 6
            let offset = limit * (page - 1)

            const params = {
                filter,
                page,
                limit,
                offset
            }

            let results = await User.paginate(params)
            const recipes = results.rows

            if(recipes[0]){
                const pagination = {
                    total: Math.ceil(recipes[0].total / limit),
                    page
                }

                results = await User.chefsSelectOptions()
                const chefs = results.rows

                let files = []
                let endIndex

                if(pagination.page == pagination.total){
                    endIndex = limit - ( limit*pagination.total - recipes[0].total )
                } else {
                    endIndex = limit
                }

                for (let i = 0; i < endIndex; i++) {
                    results = await User.recipe_files(recipes[i].id)
                    let recipe_files = results.rows[0]

                    results = await User.files(recipe_files.file_id)
                    files[i] = results.rows[0]
                }
                
                files = files.map(file => ({
                    ...file,
                    src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
                }))

                for (let i = 0; i < endIndex; i++) {
                    recipes[i] = {
                        ...files[i],
                        ...recipes[i]                    
                    }
                }
                return res.render('users/home', { recipes, pagination, filter, chefs })
                //return res.render('admin/recipes', { recipes, pagination, filter, chefs })

            } else {
                return res.render('users/home') //trocar por not-found
            }

        } catch(err){
            throw new Error(err)
        }
    },
    async allRecipes(req, res){

        // let { filter, page, limit } = req.query

        // page = page || 1
        // limit = limit || 6
        // let offset = limit * (page - 1)

        // const params = {
        //     filter,
        //     page,
        //     limit,
        //     offset,
        //     callback(recipes) {

        //         if(recipes[0]){
        //             const pagination = {
        //                 total: Math.ceil(recipes[0].total / limit),
        //                 page
        //             }

        //             User.chefsSelectOptions(function(options){
                        
        //                 return res.render('users/receitas', { recipes, pagination, filter, chefs: options })

        //             })

        //         } else {
        //             return res.render('users/receitas') //trocar por not-found
        //         }

        //     }
        // }

        // User.paginate(params)

        // //return res.render('users/receitas', {items: recipes})
        // //return res.render('users/receitas')
        // // return res.render('users/receitas', { items: data.recipes }) //

        try{
            let { filter, page, limit } = req.query

            page = page || 1
            limit = limit || 6
            let offset = limit * (page - 1)

            const params = {
                filter,
                page,
                limit,
                offset
            }

            let results = await User.paginate(params)
            const recipes = results.rows

            if(recipes[0]){
                const pagination = {
                    total: Math.ceil(recipes[0].total / limit),
                    page
                }

                results = await User.chefsSelectOptions()
                const chefs = results.rows

                let files = []
                let endIndex

                if(pagination.page == pagination.total){
                    endIndex = limit - ( limit*pagination.total - recipes[0].total )
                } else {
                    endIndex = limit
                } 
                
                for (let i = 0; i < endIndex; i++) {
                    results = await User.recipe_files(recipes[i].id)
                    let recipe_files = results.rows[0]

                    results = await User.files(recipe_files.file_id)
                    files[i] = results.rows[0]
                }
                
                files = files.map(file => ({
                    ...file,
                    src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
                }))

                for (let i = 0; i < endIndex; i++) {
                    recipes[i] = {
                        ...files[i],
                        ...recipes[i]                    
                    }
                }
                return res.render('users/receitas', { recipes, pagination, filter, chefs })
                // return res.render('users/home', { recipes, pagination, filter, chefs })
                //return res.render('admin/recipes', { recipes, pagination, filter, chefs })

            } else {
                return res.render('users/receitas') //trocar por not-found
            }

        } catch(err){
            throw new Error(err)
        }
    },
    async showRecipes(req, res){

        // // User.find(req.params.id, function(recipe){
        // //     if(!recipe) return res.send('recipe not found')

        // //     recipe.created_at = date(recipe.created_at).format

        // //     User.chefsSelectOptions(function(options){
                        
        // //         return res.render('users/view_recipe', { recipeClicked: recipe, chefs: options })

        // //     })
        // // })

        try {
            let results = await User.find(req.params.id)
            const recipe = results.rows[0]

            if (!recipe) return res.send('Recipe not found!')

            recipe.created_at = date(recipe.created_at).format

            results = await User.chefsSelectOptions()
            const chefs = results.rows

            // get recipe_files
            results = await User.recipe_files(recipe.id)
            const recipe_files = results.rows

            let files = []
            for (let i = 0; i < recipe_files.length; i++) {
                results = await User.files(recipe_files[i].file_id)
                files[i] = results.rows[0]
            }

            files = files.map(file => ({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            }))
            ///console.log(files)

            return res.render('users/view_recipe', { recipeClicked: recipe, chefs, files })
            return res.render('admin/recipeShow', { item: recipe, chefs, files })

        } catch (err) {
            throw new Error(err)
        }

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