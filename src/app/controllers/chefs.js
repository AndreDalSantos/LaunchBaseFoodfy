const { date } = require('../../lib/utils')
const Chef = require('../models/Chef')
const File = require('../models/File')
const RecipeFile = require('../models/RecipeFile')

module.exports = {
    async index(req, res){
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
    
            let results = await Chef.paginate(params)
            const chefs = results.rows
    
            if(chefs[0]){
    
                const pagination = {
                    total: Math.ceil(chefs[0].total / limit),
                    page
                }

                let fileChef = []

                for( i = 0; i < chefs.length; i++ ) {
                    fileChef[i] = (await File.fileFromChef(chefs[i].file_id)).rows[0]

                    chefs[i] = {
                        ...chefs[i],
                        avatar_url: `${req.protocol}://${req.headers.host}${fileChef[i].path.replace("public", "")}`
                    }
                }
    
                return res.render('chefs/index', { chefs, pagination, filter })
    
            } else {
                return res.render('chefs/index')
            } 
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
            
            const file = req.files[0]
            
            let results = await File.create(file)
            const fileId = results.rows[0].id

            results = await Chef.create({...req.body, user_id: req.session.userId, file_id: fileId})
            const chefId = results.rows[0].id
            

            return res.redirect(`/chefs/${chefId}/edit`)


        } catch(err){
            throw new Error(err)
        }
    },
    async show(req, res){
        try{

            if(!isNaN(parseFloat(req.params.id)) && isFinite(req.params.id)){

                let results = await Chef.find(req.params.id)
                let chef = results.rows[0]

                if(!chef) return res.send('chef not found')

                chef.created_at = date(chef.created_at).format

                results = await File.fileFromChef(chef.file_id)
                let file = results.rows[0] 

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
                return res.send('Chef not found')
            }

        } catch(err){
            throw new Error(err)
        }       
    },
    async edit(req, res){

        try {
            if(!isNaN(parseFloat(req.params.id)) && isFinite(req.params.id)){

                let results = await Chef.find(req.params.id)
                const chef = results.rows[0]

                if(!chef)
                    return res.send('chef not found')

                chef.created_at = date(chef.created_at).format

                results = await File.fileFromChef(chef.file_id)
                let file = results.rows[0]

                file = {
                    ...file,
                    src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
                }

                return res.render('chefs/edit', { chef, files: file })


            } else
                return res.send('chef not found') 

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
            results = await File.create(req.files[0])
            newFilesId = results.rows[0].id
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
            
            const removedFilesPromise = await File.delete(Number(removedFiles))
        }

        return res.redirect(`/chefs`)
        return res.redirect(`/chefs/${req.body.id}/edit`)
    },
    async delete(req, res){

        const fileId = ((await Chef.findFile(req.body.id)).rows[0]).file_id
        
        await Chef.delete(req.body.id)
        await File.delete(fileId)

        return res.redirect('/chefs')

    }
}