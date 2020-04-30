const { date } = require('../../lib/utils')
const Recipe = require('../models/Recipe')

module.exports = {
    index(req, res) {
        let { filter, page, limit } = req.query

        page = page || 1
        limit = limit || 4
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
                    Recipe.chefsSelectOptions(function(options){
                        
                        return res.render('admin/recipes', { recipes, pagination, filter, chefs: options })

                    })
                } else {
                    return res.render('admin/recipes') //trocar por not-found
                }

            }
        }

        Recipe.paginate(params)
        // return res.render('admin/recipes', { items: data.recipes })
        //return res.render('admin/recipes')
        //return res.send('index - admin')
    },
    create(req, res) {

        Recipe.chefsSelectOptions(function(options){
            return res.render('admin/createRecipe', { chefOptions: options })
        })

        // return res.render('admin/createRecipe')
        //return res.send('create recipe')
    },
    show(req, res) {

        Recipe.find(req.params.id, function(recipe){
            if(!recipe) return res.send('recipe not found')

            recipe.created_at = date(recipe.created_at).format

            Recipe.chefsSelectOptions(function(options){
                // console.log(options)
                return res.render('admin/recipeShow', { item: recipe, chefs: options })
            })

            //return res.render("admin/recipeShow", { item: recipe })
        })

        //return res.send('show admin unit')

        // return res.render("admin/recipeShow", { item: recipe })
    },
    post(req, res){
        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ''){
                return res.send('Please, fill all the fields')
            }
        }
    
    
        Recipe.create(req.body, function(recipe){
            return res.redirect(`/admin/recipes/${recipe.id}`)
        })
    },
    edit(req, res){
        
        Recipe.find(req.params.id, function (recipe) {
            if (!recipe) return res.send('recipe not found')

            recipe.created_at = date(recipe.created_at).format

            Recipe.chefsSelectOptions(function(options){
                // console.log(options)
                return res.render('admin/edit', { recipe, chefOptions: options })
            })
        })
    },
    put(req, res){
        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ''){
                return res.send('Please, fill all the fields')
            }
        }

        Recipe.update(req.body, function() {
            return res.redirect(`/admin/recipes/${req.body.id}`)
        })

        // return res.redirect(`/admin/recipes/${id}`)
    },
    delete(req, res){
        
        Recipe.delete(req.body.id, function() {
            return res.redirect(`/admin/recipes`)
        })
        // return res.redirect('/admin/recipes')
    }
}

