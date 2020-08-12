const User = require('../models/User')
const RecipeFile = require('../models/RecipeFile')
const File = require('../models/File')
const Chef = require('../models/Chef')
const Recipe = require('../models/Recipe')


module.exports = {
    async indexPaginate(data, maxLimit){
        let { filter, page, limit } = data
    
        page = page || 1
        limit = limit || maxLimit
        let offset = limit * (page - 1)

        let users = []

        if(!(!isNaN(parseFloat(page)) && isFinite(page))) return {}
    
        const params = {
            filter,
            page,
            limit,
            offset
        }

        let results = await User.paginate(params)
        users = results.rows

        if(users[0]){
    
            const pagination = {
                total: Math.ceil(users[0].total / limit),
                page
            }    
            
            return { users, pagination, filter }

        } else {
            return {}
        }        
    },
    async showRecipesPaginate(data, maxLimit){
        let { filter, page, limit } = data.query
             
        page = page || 1
        limit = limit || maxLimit
        let offset = limit * (page - 1)

        if(!(!isNaN(parseFloat(page)) && isFinite(page))) return {}
    
        const params = {
            filter,
            page,
            limit,
            offset
        }

        let results = await Recipe.paginate(params)
        let recipes = results.rows
        
        if(recipes[0]){

            const pagination = {
                total: Math.ceil(recipes[0].total / limit),
                page
            }

            results = await Recipe.selectChefs()
            const chefs = results.rows

            const recipesPromise = recipes.map(async recipe => {
                results = await RecipeFile.allFromOneRecipe(recipe.id)
                let recipeFile = results.rows[0]

                results = await File.allFilesFromRecipeFile(recipeFile)
                let file = results.rows[0]

                file = {
                    ...file,
                    src: `${data.protocol}://${data.headers.host}${file.path.replace("public", "")}`
                }

                recipe = {
                    ...recipe,
                    file
                }
                
                return recipe
            })

            recipes = await Promise.all(recipesPromise)

            return { recipes, pagination, filter: params.filter, chefs }    

        } else {
            return {}
        }
    },
    async showChefsPaginate(data, maxLimit){
        let { filter, page, limit } = data.query

        page = page || 1
        limit = limit || maxLimit
        let offset = limit * (page - 1)

        if(!(!isNaN(parseFloat(page)) && isFinite(page))) return {}

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
                fileChef[i] = await File.find(chefs[i].file_id)

                chefs[i] = {
                    ...chefs[i],
                    avatar_url: `${data.protocol}://${data.headers.host}${fileChef[i].path.replace("public", "")}`
                }
            }

            return { chefs, pagination, filter }

        } else {
            return {}
        } 
    }
}