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
    create(data) {

        const query = `
        INSERT INTO recipes (
            chef_id,
            title,
            ingredients,
            preparation,
            information,
            created_at
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
    `

        const values = [
            data.chef,
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            date(Date.now()).iso
        ]

        return db.query(query, values)        

    },
    find(id){

        return db.query(`
            SELECT recipes.*, chefs.name AS chef_name 
            FROM recipes 
            LEFT JOIN chefs ON (recipes.chef_id = chefs.id)
            WHERE recipes.id = $1`, [id])

    },
    update(data){
        const query = `
            UPDATE recipes SET
            chef_id=($1),
            title=($2),
            ingredients=($3),
            preparation=($4),
            information=($5)
        WHERE id = $6
        `

        const values = [
            data.chef,       //mudar
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            data.id
        ]

        return db.query(query, values)
        
    },
    delete(id){

        return db.query(`DELETE FROM recipes WHERE id = $1`, [id])

        
    },
    chefsSelectOptions(){

        return db.query(`SELECT * FROM chefs`)

      
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

    },
    getRecipes(id){
        
        query = `SELECT * FROM recipes            
            WHERE recipes.chef_id = $1`

        return db.query(query, [id])

        // db.query(query, [id], function(err, results){
        //     if(err) `database error -> ${err}`
   
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