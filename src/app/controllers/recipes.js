const { date } = require('../../lib/utils')
const Recipe = require('../models/Recipe')
const File = require('../models/File')
const RecipeFile = require('../models/RecipeFile')
const Chef = require('../models/Chef')
const User = require('../models/User')

module.exports = {
    async index(req, res) {
        try {
            let { filter, page, limit } = req.query

            page = page || 1
            limit = limit || 12
            let offset = limit * (page - 1)
    
            const params = {
                filter,
                page,
                limit,
                offset
            }
    
            let results = await Recipe.paginate(params)
            const recipes = results.rows
    
            if(recipes[0]){
    
                const pagination = {
                    total: Math.ceil(recipes[0].total / limit),
                    page
                }
    
                results = await Recipe.selectChefs()
                const chefs = results.rows
    
                let changedRecipe = []
    
                for(i = 0; i < recipes.length; i++){
    
                    results = await RecipeFile.allFromOneRecipe(recipes[i].id)
                    let recipeFile = results.rows[0]
    
                    results = await File.allFilesFromRecipeFile(recipeFile)
                    let file = results.rows[0]
    
                    file = {
                        ...file,
                        src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
                    }
    
                    changedRecipe[i] = {
                        ...recipes[i],
                        file
                    }
                }
    
                return res.render('admin/index', { recipes:changedRecipe, pagination, filter: params.filter, chefs })
    
            } else {
                return res.render('admin/index') 
            } 
        } catch(err){
            throw new Error(err)
        }
    },
    async create(req, res){

        try {
            let results = await Recipe.selectChefsFromUser(req.session.userId)
            const chefs = results.rows

            if(!chefs[0])
                return res.redirect('/chefs/create')

            return res.render('admin/create', {chefOptions: chefs})

        }
        catch(err){
            throw `Error: ${err}`
        }

        // Recipe.selectChefs(function(options){
        //     return res.render('admin/create', {chefOptions: options})
        // })
    },
    async post(req, res){
        try {
            const keys = Object.keys(req.body)

            for(key of keys){
                if(req.body[key] == ''){
                    return res.send('Please fill in all fields')
                }
            }
    
            if(req.files.length == 0)
                return res.send('Please, send at least one image')   
            
            const userId = (await Chef.getUserOfChef(req.body.chef)).rows[0].user_id
            
            // console.log(req.body)
            // console.log(userId)
            // return res.send('fim')
    
            let results = await Recipe.create(req.body, userId)
            const recipeId = results.rows[0].id
    
            const filesPromise = req.files.map(file => File.create({
                ...file
            }))
            results = await Promise.all(filesPromise)
    
            const recipeFilesPromise = results.map(fileId => RecipeFile.create({
                file_id: fileId.rows[0].id,
                recipe_id: recipeId
            }))
            await Promise.all(recipeFilesPromise)
    
            return res.redirect(`/admin/recipes/${recipeId}/edit`)
        }
        catch (err) {
            throw new Error(err)
        }
     
    },
    async show(req, res){
        try{
            if(!isNaN(parseFloat(req.params.id)) && isFinite(req.params.id)) {
                let results = await Recipe.find(req.params.id)
                const recipe = results.rows[0]
        
                if(!recipe) return res.send('Recipe not found')
        
                results = await Recipe.getChefName(recipe.chef_id)
                const chef = results.rows[0]
        
                results = await RecipeFile.allFromOneRecipe(recipe.id)
                const recipeFiles = results.rows
        
                let files = []
        
                for (let i = 0; i < recipeFiles.length; i++) {
                    results = await File.allFilesFromRecipeFile(recipeFiles[i])
                    files[i] = results.rows[0]
                }
        
                files = files.map(file => ({
                    ...file,
                    src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
                }))
        
                return res.render('admin/view_recipe', { recipe, chef, files})
            }
            else 
                return res.send('Recipe not found')
        } catch(err){
            throw new Error(err)
        }
        Recipe.find(req.params.id, function(recipe){
            if(!recipe) return res.send('Recipe not found')

            recipe.created_at = date(recipe.created_at).format

            return res.render('admin/view_recipe', { recipe })
        })
    },
    async edit(req, res){
        try {

            if(!isNaN(parseFloat(req.params.id)) && isFinite(req.params.id)){
                let results = await Recipe.find(req.params.id)
                const recipe = results.rows[0]
        
                if(!recipe) return res.render('admin/index', {
                    error: 'Receita inexistente.'
                })

                const userLogged = await User.findOne({
                    where: { id: req.session.userId }
                })

                results = await Recipe.find(req.params.id)
                const ownerUserId = results.rows[0].user_id

                if(userLogged.is_admin && userLogged !== ownerUserId) 
                    results = await Recipe.selectChefsFromUser(ownerUserId)
                else
                    results = await Recipe.selectChefsFromUser(userLogged.id)
                const chefs = results.rows
        
                results = await RecipeFile.allFromOneRecipe(recipe.id)
                const recipeFiles = results.rows
        
                let files = []
        
                for (let i = 0; i < recipeFiles.length; i++) {
                    results = await File.allFilesFromRecipeFile(recipeFiles[i])
                    files[i] = results.rows[0]
                }
        
                files = files.map(file => ({
                    ...file,
                    src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
                }))
        
                return res.render('admin/edit', { recipe, chefOptions: chefs, files})
            } else {
                return res.send('Recipe not found')
            }
        }
        catch (err){
            throw new Error(err)
        }
    },
    async put(req, res){

        try {

            const keys = Object.keys(req.body)

            for(key of keys){
                if(req.body[key] == '' && key != "removed_files"){
                    return res.send('Please fill in all fields')
                }
            }

            if(req.body.removed_files){
                const removedFiles = req.body.removed_files.split(',')
                const lastIndex = removedFiles.length - 1
                // removed files -> array de id's dos arquivos removidos
                removedFiles.splice(lastIndex, 1)

                const removedRecipeFilePromise = removedFiles.map(id => RecipeFile.delete(id))
                await Promise.all(removedRecipeFilePromise)

                const removedFilesPromise = removedFiles.map(id => File.delete(id))
                await Promise.all(removedFilesPromise)
            }

            if(req.files.length != 0){

                const oldRecipeFiles = await Recipe.findRecipeFiles(req.body.id)
                const totalFiles = oldRecipeFiles.rows.length + req.files.length

                if(totalFiles <= 5){
                    let results = ''
                    const filesPromise = req.files.map(file => File.create({
                        ...file
                    }))
                    results = await Promise.all(filesPromise)
            
                    const recipeFilesPromise = results.map(fileId => RecipeFile.create({
                        file_id: fileId.rows[0].id,
                        recipe_id: req.body.id
                    }))
                    await Promise.all(recipeFilesPromise) 
                }              
            }
        
            await Recipe.update(req.body)

            return res.redirect(`/admin/recipes/${req.body.id}`)


        } catch (err) {
            throw new Error(err)
        }
    },
    async delete(req, res){
        try {

            let results = await Recipe.findRecipeFiles(req.body.id)
            const recipeFiles = results.rows

            const filesIds = []
            for(i=0; i<recipeFiles.length; i++){
                filesIds[i] = recipeFiles[i].file_id
            }

            const removedRecipeFilePromise = filesIds.map(id => RecipeFile.delete(id))
            await Promise.all(removedRecipeFilePromise)

            const removedFilesPromise = filesIds.map(id => File.delete(id))
            await Promise.all(removedFilesPromise)

            await Recipe.delete(req.body.id)
            return res.redirect('/admin/recipes/create')

        } catch (err) {
            throw new Error(err)
        }
        // Recipe.delete(req.body.id, function(){
        //     return res.redirect('/admin/recipes')
        // })
    }
}