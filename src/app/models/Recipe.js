const db = require('../../config/db')

const Base = require('./Base')

Base.init({ table: 'recipes' })

module.exports = {
    ...Base,
    createRecipe(data){
       
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
            data.chef_id,
            data.title,
            data.ingredients,
            data.preparation,
            data.information,
            data.user_id 
        ]

        return db.query(query, values)
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
            data.ingredients,            
            data.preparation,            
            data.information,
            data.id           
        ]
        
        return db.query(query, values)
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
    // async checkIfExistsAnyRecipe(){
    //     const recipes = await db.query(`SELECT * FROM recipes`)

    //     if(!recipes.rows[0]) return false
    //     return true
    // }
}