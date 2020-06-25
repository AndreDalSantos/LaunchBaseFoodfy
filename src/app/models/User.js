const db = require('../../config/db')

module.exports = {
    paginate(params){ 
        const { filter, limit, offset } = params

        let query = "",
        filterQuery = "",
            totalQuery = `(
                SELECT count(*) FROM recipes
            ) AS total`        

        if (filter){

            filterQuery = `
            WHERE recipes.title ILIKE '%${filter}%'`

            totalQuery = `(
                SELECT count(*) FROM recipes
                ${filterQuery}
            ) AS total`

        }        

        query = `
        SELECT recipes.*, ${totalQuery}
        FROM recipes
        ${filterQuery}
        ORDER BY updated_at DESC
        LIMIT $1 OFFSET $2`

        return db.query(query, [limit, offset])
    },
    selectChefs(){
        return db.query(`
            SELECT name, id FROM chefs
        `)
    },
    findRecipe(id){
        const query = `
            SELECT * FROM recipes
            WHERE recipes.id = $1
        `

        return db.query(query, [id])
    },
    getChefName(id){
        const query = `
            SELECT name FROM chefs
            WHERE chefs.id = $1
        `

        return db.query(query, [id])
    }
}