const { date } = require('../../lib/utils')
const Chef = require('../models/Chef')
const File = require('../models/File')
const RecipeFile = require('../models/RecipeFile')

const { showChefsPaginate } = require('../services/services')


module.exports = {
    async index(req, res){
        try {
            let { chefs, pagination, filter } = await showChefsPaginate(req, 12)

            if(chefs)
                return res.render('chefs/index', { chefs, pagination, filter })
            else
                return res.render('admin/error', { userId: req.session.userId })                
             
        } catch(err){
            throw new Error(err)
        }  
    },
    create(req, res){
        return res.render('chefs/create')
    },
    async post(req, res){
        try{
            const keys = Object.keys(req.body)

            for(key of keys){
                if(req.body[key] == ''){
                    return res.send('Please fill in all fields')
                }
            }
            
            if(!req.files)
                return res.send('Please, send one image')
            
            const { filename: name, path } = req.files[0]
            
            const fileId = await File.create({ name, path })

            const chefId = await Chef.create({name: req.body.name, user_id: req.session.userId, file_id: fileId})            

            return res.render('admin/success', {
                route: `/chefs/${chefId}/edit`,
                message: 'Chef criado com sucesso!'
            })


        } catch(err){
            throw new Error(err)
        }
    },
    async show(req, res){
        try{

            if(!isNaN(parseFloat(req.params.id)) && isFinite(req.params.id)){

                let results = await Chef.findAll(req.params.id)
                let chef = results.rows[0]

                if(!chef) return res.render('admin/error', { userId: req.session.userId })                


                chef.created_at = date(chef.created_at).format

                let file = await File.find(chef.file_id)

                file = {
                    ...file,
                    src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
                }

                chef = {
                    ...chef,
                    avatar_url: file.src
                }

                results = await Chef.getRecipes(req.params.id)
                let recipes = results.rows

                recipes.forEach(recipe => {
                    recipe.created_at = date(recipe.created_at).format
                })

                let recipeFilesFirst = []

                for( i = 0; i < recipes.length; i++ ) {
                    recipeFilesFirst[i] = (await RecipeFile.allFromOneRecipe(recipes[i].id)).rows[0]
                }

                let fileRecipes = []

                for( i = 0; i < recipeFilesFirst.length; i++ ) {
                    fileRecipes[i] = (await File.allFilesFromRecipeFile(recipeFilesFirst[i])).rows[0]
                    fileRecipes[i] = {
                        ...fileRecipes[i],
                        src: `${req.protocol}://${req.headers.host}${fileRecipes[i].path.replace("public", "")}`
                    }
                }

                for( i = 0; i < recipes.length ; i++ ) {
                    recipes[i] = {
                        ...recipes[i],
                        src: fileRecipes[i].src
                    }
                }              

                return res.render('chefs/view_chef', { chef, recipes })

            } else {
                return res.render('admin/error', { userId: req.session.userId })
            }

        } catch(err){
            throw new Error(err)
        }       
    },
    async edit(req, res){

        try {
            if(!isNaN(parseFloat(req.params.id)) && isFinite(req.params.id)){

                let results = await Chef.findAll(req.params.id)
                const chef = results.rows[0]

                chef.created_at = date(chef.created_at).format 

                let file = await File.find(chef.file_id)

                file = {
                    ...file,
                    src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
                }

                return res.render('chefs/edit', { chef, files: file })

            } else
                return res.render('admin/error', { userId: req.session.userId }) 

        } catch(err) {
            throw new Error(err)
        }
    },
    async put(req, res){
        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == '' && key != "removed_files"){
                return res.send('Please fill in all fields')
            }
        }

        let results = [],
            newFilesId = '',
            chef = {
                id: req.body.id
            },
            changeFile = false     

        if(req.files != 0){
            const { filename: name, path } = req.files[0]            
            newFilesId = await File.create({ name, path })
            changeFile = true
        }

        if(changeFile){
            chef = {
                ...chef,
                file_id: newFilesId,
                name: req.body.name
            }

            await Chef.update(chef)

        }
        else {
            chef = {
                ...chef,
                name: req.body.name
            }

            await Chef.updateWithoutChangedPhoto(chef)
        }

        if(req.body.removed_files){
            const removedFiles = req.body.removed_files.split(',')
            const lastIndex = removedFiles.length - 1
            removedFiles.splice(lastIndex, 1)
            
            const removedFilesPromise = await File.deleteFile(Number(removedFiles))
        }

        return res.render('admin/success', {
            route: `/chefs/${req.body.id}`,
            message: 'Chef atualizado com sucesso!'
        })
    },
    async delete(req, res){
        const fileId = ((await Chef.findFile(req.body.id)).rows[0]).file_id

        await Chef.delete(req.body.id)
        await File.deleteFile(fileId)

        return res.render('admin/success', {
            route: `/chefs`,
            message: 'Chef excluído com sucesso!'
        })

    }
}