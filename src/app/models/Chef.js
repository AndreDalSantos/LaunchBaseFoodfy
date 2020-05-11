const { date } = require('../../lib/utils')
const Intl = require('intl')
const db = require('../../config/db')

module.exports = {
    all(callback) {
        db.query(`SELECT * FROM recipes`, function (err, results) {
            if (err) throw `database error!! ${err}`

            callback(results.rows)
        })
    },
    create(data, callback) {

        const query = `
        INSERT INTO chefs (
            name,
            avatar_url,
            created_at
        ) VALUES ($1, $2, $3)
        RETURNING id
    `

        const values = [
            data.name,
            data.avatar_url,
            date(Date.now()).iso
        ]

        db.query(query, values, function (err, results) {
            if (err) throw `database error!! ${err}`

            callback(results.rows[0])
        })

    },
    find(id){
        // db.query(`
        //     SELECT * 
        //     FROM chefs 
        //     WHERE id = $1`, [id], function(err, results){
        //         if (err) throw `database error!! ${err}`

        //         callback(results.rows[0])
        //     })

        const query = `
            SELECT chefs.*, (SELECT count(*) FROM chefs) AS total, count(recipes) AS total_recipes
            FROM chefs
            LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
            WHERE chefs.id = $1
            GROUP BY chefs.id
        `
        return db.query(query, [id])

        // db.query(`
        // SELECT chefs.*, (SELECT count(*) FROM chefs) AS total, count(recipes) AS total_recipes
        // FROM chefs
        // LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
        // WHERE chefs.id = $1
        // GROUP BY chefs.id
        // `, [id], function(err, results){
        //     if(err) throw `database error: ${err}`

        //     //console.log(results.rows[0])
        //     callback(results.rows[0])
        // })

    },
    update(data, callback){
        const query = `
            UPDATE chefs SET
            avatar_url=($1),
            name=($2)
        WHERE id = $3
        `

        const values = [
            data.avatar_url,
            data.name,       
            data.id
        ]

        db.query(query, values, function(err, results){
            if (err) throw `database error!! ${err}`

            callback()
        })
    },
    delete(id, callback){
        db.query(`DELETE FROM chefs WHERE id = $1`, [id], function(err, results){
            if (err) throw `database error!! ${err}`

            return callback()
        })
    },
    paginate(params){
        const { filter, limit, offset, callback } = params

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
        SELECT chefs.*, ${totalQuery}, count(recipes) AS total_recipes
        FROM chefs
        LEFT JOIN recipes ON (chefs.id = recipes.chef_id)
        ${filterQuery}
        GROUP BY chefs.id
        ORDER BY total_recipes DESC
        LIMIT $1 OFFSET $2`

        db.query(query, [limit, offset], function(err, results){
            if(err) throw `database error ${err}`

            callback(results.rows)
        })

    }    
}