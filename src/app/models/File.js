const db = require('../../config/db')
const fs = require('fs')
const RecipeFile = require('./RecipeFile')

module.exports = {
    async create({ filename, path, recipe_id }) {

        const query = `
        INSERT INTO files (
            name,
            path
        ) VALUES ($1, $2)
        RETURNING id
    `

        const values = [
            filename,
            path
        ]

        const result = await db.query(query, values)
        const fileId = result.rows[0].id

        await RecipeFile.create(recipe_id, fileId)

        return result

    },
    async delete(id) {

        try {

            const result = await db.query(`SELECT * FROM files WHERE id = $1`, [id])
            const file = result.rows[0]

            fs.unlinkSync(file.path)

            await RecipeFile.delete(id)

            return db.query(`DELETE FROM files WHERE id = $1`, [id])


        } catch (err) {
            console.error(err)
        }

    }
}