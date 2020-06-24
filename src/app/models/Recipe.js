const { date, removesEmptyPositionsFromArray } = require('../../lib/utils')
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
    create(data){
        const query = `
            INSERT INTO recipes (
                chef_id,
                title,
                ingredients,
                preparation,
                information
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        `

        const values = [
            data.chef,
            data.title,
            removesEmptyPositionsFromArray(data.ingredients),
            removesEmptyPositionsFromArray(data.preparation),
            data.information
        ]

        return db.query(query, values)
    },
    find(id){
        return db.query(`
        SELECT * FROM recipes
        WHERE id = $1
    `, [id])
    },
    update(data, callback){

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
            data.chef,              
            data.title,            
            removesEmptyPositionsFromArray(data.ingredients),            
            removesEmptyPositionsFromArray(data.preparation),            
            data.information,
            data.id            
        ]

        return db.query(query, values)
    },
    delete(id){
        const query = `DELETE FROM recipes WHERE id = $1`

        return db.query(query, [id])
    },
    chefSelectOptions(){
        return db.query(`
            SELECT name, id FROM chefs
        `)
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
    findRecipeFiles(recipeId){
        return db.query(`
            SELECT * FROM recipe_files WHERE recipe_files.recipe_id = $1
        `, [recipeId])
    },
    getChefName(chefId){
        const query = `
            SELECT * FROM chefs
            WHERE chefs.id = $1
        `

        return db.query(query, [chefId])
    }
}