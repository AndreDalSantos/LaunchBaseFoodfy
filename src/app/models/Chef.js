const { date } = require('../../lib/utils')
const db = require('../../config/db')
// const chef = require('../validators/chef')

const Base = require('./Base')

Base.init({ table: 'chefs' })

module.exports = {
    ...Base,
    findAll(id){
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
    getRecipes(id){

        query = `
            SELECT * FROM recipes
            WHERE recipes.chef_id = $1
        `

        return db.query(query, [id])
    },    
    getUserOfChef(chef_id){
        return db.query(`SELECT user_id FROM chefs WHERE id = $1`, [chef_id])
    },
    getUserId(chefId){
        return db.query(`SELECT user_id FROM chefs WHERE id = $1`,[chefId])
    }
    // async checkIfExistsAnyChef(){
    //     const chefs = await db.query(`SELECT * FROM chefs`)

    //     if(!chefs.rows[0]) return false
    //     return true
    // }
}