const db = require('../../config/db')
const fs = require('fs')

module.exports = {
    create (recipe_id, file_id){
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
    delete(id){

        return db.query(`DELETE FROM recipe_files WHERE file_id = $1`, [id])
    },
    async findRecipeFile(recipeId){
        try{
            const results = await db.query(`
                                    SELECT * FROM recipe_files 
                                    WHERE recipe_id = $1`, [recipeId])
            return results
        } catch (err) {
            console.error(err)
        }
        
    }
}