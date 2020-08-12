const db = require('../../config/db')

const Base = require('./Base')

Base.init({ table: 'recipe_files' })

module.exports = {
    ...Base,
    allFromOneRecipe(recipeId){        
        const query = `
            SELECT * FROM recipe_files
            WHERE recipe_files.recipe_id = $1
        `
        return db.query(query, [recipeId])
    },
    deleteRecipeFile(file_id){
        const query = `
            DELETE FROM recipe_files WHERE recipe_files.file_id = $1
        `
        return db.query(query, [file_id])
    }
}