const db = require('../../config/db')
const fs = require('fs')

const Base = require('./Base')

Base.init({ table: 'files' })

module.exports = {
    ...Base,
    allFilesFromRecipeFile(recipeFile){
        const query = `
            SELECT * FROM files
            WHERE files.id = $1
        `
        return db.query(query, [recipeFile.file_id])
    },
    async deleteFile(id){
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
    },
    fileFromChef(file_id){
        const query = `
            SELECT * FROM files
            WHERE files.id = $1
        `

        return db.query(query, [file_id])
    }
}