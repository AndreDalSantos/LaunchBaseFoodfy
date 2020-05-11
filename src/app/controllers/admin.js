const { date } = require('../../lib/utils')
const Recipe = require('../models/Recipe')
const File = require('../models/File')
const RecipeFile = require('../models/RecipeFile')


module.exports = {
    async index(req, res) {
        try{
            const pageLimit = 6
            let { filter, page, limit } = req.query

            page = page || 1
            limit = limit || pageLimit
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

                // console.log(limit)
                // console.log(offset)
                // return console.log(pagination)


                results = await Recipe.chefsSelectOptions()
                const chefs = results.rows

                let files = []
                let endIndex

                if(pagination.page == pagination.total){
                    endIndex = limit - ( limit*pagination.total - recipes[0].total )
                } else {
                    endIndex = limit
                }  
                
                for (let i = 0; i < endIndex; i++) {
                    results = await Recipe.recipe_files(recipes[i].id)
                    let recipe_files = results.rows[0]

                    results = await Recipe.files(recipe_files.file_id)
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

                return res.render('admin/recipes', { recipes, pagination, filter, chefs })

            } else {
                return res.render('admin/recipes') //trocar por not-found
            }

        } catch(err){
            throw new Error(err)
        }
    },
    async create(req, res) {

        try{
            const results = await Recipe.chefsSelectOptions()
            const chefOptions = results.rows

            return res.render('admin/createRecipe', { chefOptions })

        } catch(err){
            throw new Error(err)
        }
    },
    async show(req, res) {

        try {
            let results = await Recipe.find(req.params.id)
            const recipe = results.rows[0]

            if (!recipe) return res.send('Recipe not found!')

            recipe.created_at = date(recipe.created_at).format

            results = await Recipe.chefsSelectOptions()
            const chefs = results.rows

            // get recipe_files
            results = await Recipe.recipe_files(recipe.id)
            const recipe_files = results.rows

            let files = []
            for(let i = 0; i < recipe_files.length; i++) {
                results = await Recipe.files(recipe_files[i].file_id)
                files[i] = results.rows[0]
            }

            files = files.map(file => ({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            }))
            ///console.log(files)


            return res.render('admin/recipeShow', { item: recipe, chefs, files })

        } catch (err) {
            throw new Error(err)
        }

    },
    async post(req, res){
        try{
            const keys = Object.keys(req.body)

            for(key of keys){
                if(req.body[key] == ''){
                    return res.send('Please, fill all the fields')
                }
            }
    
            if(req.files.length == 0)
                return res.send("Please, send at least one image")
            
            
            let results = await Recipe.create(req.body)
            const recipeId = results.rows[0].id
            
            const filesPromise = req.files.map(file => File.create({...file, recipe_id: recipeId}))
            await Promise.all(filesPromise)

            results = await Recipe.find(recipeId)
            console.log(results.rows)

            return res.redirect(`/admin/recipes/${recipeId}`)
        } catch (err) {
            throw new Error(err)
        }
    },
    async edit(req, res) {

        try {
            let results = await Recipe.find(req.params.id)
            const recipe = results.rows[0]

            if (!recipe) return res.send('recipe not found')

            recipe.created_at = date(recipe.created_at).format

            // get chefs
            results = await Recipe.chefsSelectOptions()
            const chefOptions = results.rows

            // get recipe_files
            results = await Recipe.recipe_files(recipe.id)
            const recipe_files = results.rows

            let files = []
            for(let i = 0; i < recipe_files.length; i++) {
                results = await Recipe.files(recipe_files[i].file_id)
                files[i] = results.rows[0]
            }

            files = files.map(file => ({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            }))

            return res.render('admin/edit', { recipe, chefOptions, files })

        } catch (err) {
            throw new Error(err)
        }
        
    },
    async put(req, res){
        try {
            const keys = Object.keys(req.body)

            for (key of keys) {
                if (req.body[key] == '' && key != "removed_files") {
                    return res.send('Please, fill all the fields')
                }
            }

            if (req.files.length != 0) {
                const newFilesPromise = req.files.map(file =>
                    File.create({ ...file, recipe_id: req.body.id }))

                await Promise.all(newFilesPromise)
            }

            if (req.body.removed_files) {
                const removedFiles = req.body.removed_files.split(",")
                const lastIndex = removedFiles.length - 1
                removedFiles.splice(lastIndex, 1)

                const removedFilesPromise = removedFiles.map(id => File.delete(id))
                await Promise.all(removedFilesPromise)
            }

            await Recipe.update(req.body)

            return res.redirect(`/admin/recipes/${req.body.id}/edit`)
        } catch(err){
            throw new Error(err)
        }

    },
    async delete(req, res){

        try {
            let results = await RecipeFile.findRecipeFile(req.body.id)
            const recipeFiles = results.rows

            for (let i = 0; i < recipeFiles.length; i++) {
                await File.delete(recipeFiles[i].file_id)
            }

            await Recipe.delete(req.body.id)
            return res.redirect(`/admin/recipes`)
        } catch (err) {
            throw new Error(err)
        }
    }
}

