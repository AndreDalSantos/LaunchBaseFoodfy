const db = require('../../config/db')

module.exports = {
    create({ file_id, recipe_id }){

        const query = `
            INSERT INTO recipe_files (
                recipe_id,
                file_id
            ) VALUES ($1, $2)
            RETURNING id
        `

        const values = [
            recipe_id,
            file_id
        ]

        return db.query(query, values)
    },
    allFromOneRecipe(recipeId){
        
        const query = `
            SELECT * FROM recipe_files
            WHERE recipe_files.recipe_id = $1
        `

        return db.query(query, [recipeId])
    },
    delete(file_id){
        const query = `
            DELETE FROM recipe_files WHERE recipe_files.file_id = $1
        `
        return db.query(query, [file_id])
    }
}