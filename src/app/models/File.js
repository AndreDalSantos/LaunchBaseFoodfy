const db = require('../../config/db')
const fs = require('fs')
//const { delete } = require('./Recipe')

module.exports = {
    create(data){
        const query = `
            INSERT INTO files (
                name,
                path
            ) VALUES ($1, $2)
            RETURNING id
        `

        const values = [
            data.filename,
            data.path
        ]

        return db.query(query, values)
    },
    allFilesFromRecipeFile(recipeFile){
        //console.log(recipeFile)
        const query = `
            SELECT * FROM files
            WHERE files.id = $1
        `
        return db.query(query, [recipeFile.file_id])
    },
    fileFromChef(file_id){
        const query = `
            SELECT * FROM files
            WHERE files.id = $1
        `

        return db.query(query, [file_id])
    },
    async delete(id){
        try {
            const results = await db.query(`SELECT * FROM files WHERE id = $1`, [id])
            const file = results.rows[0]
            fs.unlinkSync(file.path)

            return db.query(`
                DELETE FROM files WHERE id = $1
            `, [id])

        } catch (err) {
            throw new Error(err) 
        }
    }
}