const { date } = require('../../lib/utils')
const db = require('../../config/db')

module.exports = {
    all(callback){

        const query = `
            SELECT * FROM chefs
        `
        db.query(query, function(err, results){
            if(err) throw `Database error: ${err}`

            callback(results.rows)
        })
    },
    create(data){
        const query = `
            INSERT INTO chefs (
                file_id,
                name
            ) VALUES ($1, $2)
            RETURNING id
        `

        const values = [
            data.file_id,
            data.name
        ]

        return db.query(query, values)
    },
    find(id){
        const query = `
            SELECT chefs.*, (SELECT count(*) FROM chefs) AS total, count(recipes) AS total_recipes
            FROM chefs
            LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
            WHERE chefs.id = $1
            GROUP BY chefs.id
        `

        return db.query(query, [id])
    },
    findFile(id){
        const query = `
            SELECT file_id FROM chefs
            WHERE chefs.id = $1
        `
        return db.query(query, [id])
    },
    update(data){

        const query = `
            UPDATE chefs SET
                name=($1),
                file_id=($2)
            WHERE id = $3
        `

        const values = [
            data.name,            
            data.file_id,            
            data.id            
        ]

        return db.query(query, values)

        // db.query(query, values, function(err, results){
        //     if(err) throw `Database error: ${err}`

        //     callback()
        // })
    },    
    updateWithoutChangedPhoto(data){


        const query = `
            UPDATE chefs SET
                name=($1)
            WHERE id = $2
        `

        const values = [
            data.name,            
            data.id            
        ]

        return db.query(query, values)
    },
    delete(id){
        const query = `DELETE FROM chefs WHERE id = $1`
        db.query(query, [id])
    },
    getRecipes(id){

        query = `
            SELECT * FROM recipes
            WHERE recipes.chef_id = $1
        `

        return db.query(query, [id])

        db.query(query, [id], function(err, results){
            if(err) `Database error ${err}`

            callback(results.rows)
        })
    },
    paginate(params){ 
        const { filter, limit, offset } = params

        let query = "",
        filterQuery = "",
            totalQuery = `(
                SELECT count(*) FROM chefs
            ) AS total`        

        if (filter){

            filterQuery = `
            WHERE chefs.name ILIKE '%${filter}%'`

            totalQuery = `(
                SELECT count(*) FROM chefs
                ${filterQuery}
            ) AS total`

        }        

        query = `
        SELECT chefs.*, ${totalQuery}
        FROM chefs
        ${filterQuery}
        LIMIT $1 OFFSET $2`

        return db.query(query, [limit, offset])

        // db.query(query, [limit, offset], function(err, results){
        //     if(err) throw `database error ${err}`
        //     callback(results.rows)
        // })
    }
}