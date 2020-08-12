const db = require('../../config/db')

const Base = require('./Base')

Base.init({ table: 'recipes' })

module.exports = {
    ...Base,
    getChefName(id){
        const query = `
            SELECT name FROM chefs
            WHERE chefs.id = $1
        `

        return db.query(query, [id])
    }
}