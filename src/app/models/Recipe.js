const { date, removesEmptyPositionsFromArray } = require('../../lib/utils')
const db = require('../../config/db')

module.exports = {
    create(data, userId){
        const query = `
            INSERT INTO recipes (
                chef_id,
                title,
                ingredients,
                preparation,
                information,
                user_id
            ) VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id
        `

        const values = [
            data.chef,
            data.title,
            removesEmptyPositionsFromArray(data.ingredients),
            removesEmptyPositionsFromArray(data.preparation),
            data.information,
            userId 
        ]

        return db.query(query, values)
    },
    find(id){
        return db.query(`
        SELECT * FROM recipes
        WHERE id = $1
    `, [id])
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
    selectChefs(){
        return db.query(`
            SELECT name, user_id, id FROM chefs
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
        ORDER BY updated_at DESC
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
    },
    selectChefsFromUser(userId){
        return db.query(`SELECT name, user_id, id FROM chefs WHERE user_id = $1`, [userId])
    },
    getUserId(recipeId){
        return db.query(`SELECT user_id FROM recipes WHERE id = $1`,[recipeId])
    }
}