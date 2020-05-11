const { date } = require('../../lib/utils')
const Intl = require('intl')
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
        LIMIT $1 OFFSET $2`

        return db.query(query, [limit, offset])

    },
    find(id){
        // db.query(`
        //     SELECT recipes.*, chefs.name AS chef_name 
        //     FROM recipes 
        //     LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
        //     WHERE recipes.id = $1`, [id], function(err, results){
        //         if (err) throw `database error!! ${err}`

        //         callback(results.rows[0])
        //     })

        return db.query(`SELECT recipes.* FROM recipes 
            WHERE recipes.id = $1`, [id])

        // db.query(`
        //     SELECT recipes.* FROM recipes 
        //     WHERE recipes.id = $1`, [id], function(err, results){
        //         if (err) throw `database error!! ${err}`

        //         callback(results.rows[0])
        //     })

    },
    chefsSelectOptions(){
        return db.query(`SELECT * FROM chefs`)

        // return db.query(`SELECT name, id FROM chefs`)
        // db.query(`SELECT name, id FROM chefs`, function(err, results){
        //     if(err) throw 'database error'
            
        //     callback(results.rows)
        // })
    },
    recipe_files(id){
        return db.query(`
            SELECT * FROM recipe_files 
            WHERE recipe_id = $1
        `, [id])
    },
    files(id){
        return db.query(`
            SELECT * FROM files
            WHERE files.id = $1
        `, [id])
    }
}