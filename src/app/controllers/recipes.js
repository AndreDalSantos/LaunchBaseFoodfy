const Recipe = require('../models/Recipe')
const File = require('../models/File')
const RecipeFile = require('../models/RecipeFile')
const Chef = require('../models/Chef')
const User = require('../models/User')

const { showRecipesPaginate } = require('../services/services')
const { removesEmptyPositionsFromArray } = require('../../lib/utils')


module.exports = {
    async index(req, res) {
        try {
            let results = await showRecipesPaginate(req, 12)

            results = {
                ...results,
                userId: req.session.userId
            }

            if(results.recipes)
                return res.render('admin/index', results)
            else
                return res.render('admin/error', { userId: req.session.userId, message: "Página ou parâmetros inexistentes." })              
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
    },
    async post(req, res){
        try {
            // const keys = Object.keys(req.body)
            
            // for(key of keys){
            //     if(req.body[key] == ''){
            //         return res.render('admin/error', { userId: req.session.userId, message: "Favor preencher todos os parâmetros." }) 
            //     }
            // }
            
            // if(req.files.length == 0)
            // return res.render('admin/error', { userId: req.session.userId, message: "Envie pelo menos uma imagem." }) 

            const userId = (await Chef.getUserOfChef(req.body.chef)).rows[0].user_id

            let { title, chef: chef_id, ingredients, preparation, information } = req.body

            ingredients = removesEmptyPositionsFromArray(ingredients)
            preparation = removesEmptyPositionsFromArray(preparation)

            let files = req.files.map(file => ({
                name: file.filename,
                path: file.path

            }))
    
            let results = await Recipe.createRecipe({ title, chef_id, ingredients, preparation, information, user_id: userId })            
            const recipeId = results.rows[0].id
    
            const filesPromise = files.map(file => File.create({
                ...file
            }))
            results = await Promise.all(filesPromise)
    
            const recipeFilesPromise = results.map(fileId => RecipeFile.create({
                file_id: fileId,
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
                const recipe = await Recipe.find(req.params.id)
        
                if(!recipe) return res.render('admin/error', { userId: req.session.userId, message: "Receita não encontrada!" }) 
        
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
                return res.render('admin/error', { userId: req.session.userId, message: "Página ou parâmetros inexistentes." }) 
        } catch(err){
            throw new Error(err)
        }
    },
    async edit(req, res){
        try {

            if(!isNaN(parseFloat(req.params.id)) && isFinite(req.params.id)){
                const recipe = await Recipe.find(req.params.id)
        
                if(!recipe) return res.render('admin/index', {
                    error: 'Receita inexistente.'
                })

                const userLogged = await User.findOne({
                    where: { id: req.session.userId }
                })

                results = await Recipe.find(req.params.id)
                const ownerUserId = results.user_id

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
                    return res.render('admin/error', { userId: req.session.userId, message: "Favor preencher todos os parâmetros." }) 
                }
            }

            if(req.body.removed_files){
                const removedFiles = req.body.removed_files.split(',')
                const lastIndex = removedFiles.length - 1
                // removed files -> array de id's dos arquivos removidos
                removedFiles.splice(lastIndex, 1)

                const oldRecipeFiles = await Recipe.findRecipeFiles(req.body.id)
                let totalFiles = oldRecipeFiles.rows.length + req.files.length
                totalFiles = totalFiles - removedFiles.length
                
                if(totalFiles === 0) {
                    return res.render('admin/error', { userId: req.session.userId, message: "Envie pelo menos uma imagem." }) 
                }

                const removedRecipeFilePromise = removedFiles.map(id => RecipeFile.deleteRecipeFile(id))
                await Promise.all(removedRecipeFilePromise)

                const removedFilesPromise = removedFiles.map(id => File.deleteFile(id))
                await Promise.all(removedFilesPromise)
            }

            if(req.files.length != 0){

                const oldRecipeFiles = await Recipe.findRecipeFiles(req.body.id)
                const totalFiles = oldRecipeFiles.rows.length + req.files.length

                if(totalFiles <= 5){
                    let results = ''
                    const filesPromise = req.files.map(file => File.create({
                        name: file.filename,
                        path: file.path
                    }))
                    results = await Promise.all(filesPromise)
            
                    const recipeFilesPromise = results.map(fileId => RecipeFile.create({
                        file_id: fileId,
                        recipe_id: req.body.id
                    }))
                    await Promise.all(recipeFilesPromise) 
                }              
            }

            let { title, chef: chef_id, ingredients, preparation, information } = req.body

            ingredients = removesEmptyPositionsFromArray(ingredients)
            preparation = removesEmptyPositionsFromArray(preparation)
        
            await Recipe.update({ title, chef: chef_id, ingredients, preparation, information, id: req.body.id })

            return res.render('admin/success', {
                route: `/admin/recipes/${req.body.id}`,
                message: 'Receita atualizada com sucesso!'
            })


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

            const removedRecipeFilePromise = filesIds.map(id => RecipeFile.deleteRecipeFile(id))
            await Promise.all(removedRecipeFilePromise)

            const removedFilesPromise = filesIds.map(id => File.deleteFile(id))
            await Promise.all(removedFilesPromise)

            await Recipe.delete(req.body.id)
            return res.render('admin/success', {
                route: '/admin',
                message: 'Receita deletada com sucesso!'
            })

        } catch (err) {
            throw new Error(err)
        }
    }
}