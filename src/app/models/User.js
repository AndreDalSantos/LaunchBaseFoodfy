const db = require('../../config/db')

module.exports = {
    all(callback){

        const query = `
            SELECT recipes.*, chefs.name AS chef_name
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
        `
        db.query(query, function(err, results){
            if(err) throw `Database error: ${err}`

            callback(results.rows)
        })
    },
    find(id, callback){
        
        const query = `
            SELECT recipes.*, chefs.name AS chef_name
            FROM recipes
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            WHERE recipes.id = $1
        `

        db.query(query, [id], function(err, results){
            if(err) throw `Database error: ${err}`

            callback(results.rows[0])
        })
    },
    allChefs(callback){
        const query = `
            SELECT chefs.*, count(recipes) AS total_recipes
            FROM chefs
            LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
            GROUP BY chefs.id
        `

        db.query(query, function(err, results){
            if(err) throw `Database error ${err}`

            callback(results.rows)
        })
    },
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
        LIMIT $1 OFFSET $2`

        return db.query(query, [limit, offset])

        // db.query(query, [limit, offset], function(err, results){
        //     if(err) throw `database error ${err}`
        //     callback(results.rows)
        // })
    },
    chefSelectOptions(){
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