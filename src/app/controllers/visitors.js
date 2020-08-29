const Visitor = require('../models/Visitor')
const File = require('../models/File')
const RecipeFile = require('../models/RecipeFile')
const Chef = require('../models/Chef')

const { showRecipesPaginate, showChefsPaginate } = require('../services/services')

const { date } = require('../../lib/utils')


module.exports = {
    async index(req, res){
        try {

            let results = await showRecipesPaginate(req, 6)

            results = {
                ...results,
                userId: req.session.userId
            }

            if(results.recipes)
                return res.render('visitors/home', results)
            else
                return res.render('visitors/error', { userId: req.session.userId, message: 'Página ou parâmetros não encontrados.' })                      

        } catch(err){
            throw new Error(err)
        }
    },
    async showAllRecipes(req, res){
        try {
            let results = await showRecipesPaginate(req, 6)

            results = {
                ...results,
                userId: req.session.userId
            }

            if(results.recipes)
                return res.render('visitors/recipes', results)
            else
                return res.render('visitors/error', { userId: req.session.userId, message: 'Página ou parâmetros não encontrados.' })  

        } catch(err){
            throw new Error(err)
        }
        
    },
    async showRecipe(req, res){
        try {
            if(!isNaN(parseFloat(req.params.id)) && isFinite(req.params.id))
            { 
                let recipe = await Visitor.find(req.params.id)
    
                if(!recipe) return res.render('visitors/error', { userId: req.session.userId, message: "Receita não encontrada." })
    
                result = await Visitor.getChefName(recipe.chef_id)
                let chef = result.rows[0]
    
                result = await RecipeFile.allFromOneRecipe(recipe.id)
                const recipeFiles = result.rows
    
                let files = []
    
                for (let i = 0; i < recipeFiles.length; i++) {
                    result = await File.allFilesFromRecipeFile(recipeFiles[i])
                    files[i] = result.rows[0]
                }
    
                files = files.map(file => ({
                    ...file,
                    src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
                }))
                
                return res.render('visitors/view_recipe', { recipe, chef, files, userId: req.session.userId })
    
            }
            else {
                return res.render('visitors/error', { userId: req.session.userId, message: "Receita não encontrada." })                
            }
        } catch(err){
            throw new Error(err)
        }
    },
    aboutPage(req, res){
        return res.render('visitors/about', { userId: req.session.userId })
    },
    async chefs(req, res){
        try {

            let { chefs, pagination, filter } = await showChefsPaginate(req, 12)

            if(chefs){
                let totalRecipes = []
    
                for ( i = 0; i < chefs.length; i++ ) {
                    results = await Chef.findAll(chefs[i].id)
                    totalRecipes[i] = results.rows[0].total_recipes
                    
                    chefs[i] = {
                        ...chefs[i],
                        total_recipes: totalRecipes[i]
                    }
                }
    
                return res.render('visitors/chefs', { chefs, pagination, filter, userId: req.session.userId })                
            }
            else {
                return res.render('visitors/error', { userId: req.session.userId, message: 'Página ou parâmetros não encontrados.' })
            }            
        } catch(err){
            throw new Error(err)
        }  
    }
}