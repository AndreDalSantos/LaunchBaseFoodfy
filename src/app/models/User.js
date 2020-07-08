const db = require('../../config/db')
const { hash } = require('bcryptjs')
const crypto = require('crypto')
const mailer = require('../../lib/mailer')
const Chef = require('./Chef')
const Recipe = require('./Recipe')
const File = require('./File')

module.exports = {
    async checkIfYouAreTheFirstUser(){
        try{
            const thereAreAnyUser = (await db.query(`SELECT * FROM users`)).rows[0]
            // console.log(thereAreAnyUser)
            if(thereAreAnyUser)
                return true

            return false

        } catch (err){
            console.error(err)
        }
    },
    async findOne(filters){
        try{
            let query = `SELECT * FROM users`

            Object.keys(filters).map(key => {
                query = `${query}
                ${key}`

                Object.keys(filters[key]).map(field => {
                    query = `${query} ${field} = '${filters[key][field]}'`
                })
            })

            const results = await db.query(query)

            return results.rows[0]

        } catch(err){
            console.error(err)
        }
    },
    async create(data){
        try{
            let results = await db.query(`SELECT * FROM users`)        
            results = results.rows[0]   
            
            let isAdmin = data.is_admin ? true : false
        
            if( !results )              
                isAdmin = true            

            const query = `
                INSERT INTO users (
                    name,
                    email,
                    password,
                    is_admin
                ) VALUES ($1, $2, $3, $4)
                RETURNING id
            `
                
            // const password = Math.random().toString(36).slice(-10)
            const password = crypto.randomBytes(20).toString('hex')
            const passwordHash = await hash(password, 8)

            const values = [
                data.name,
                data.email,
                passwordHash,
                isAdmin
            ]

            results = await db.query(query, values)

            await mailer.sendMail({
                to: data.email,
                from: 'no-reply@foodfy.com.br',
                subject: 'Sua senha provisória no Foodfy!',
                html: `                
                    <h2>Sua senha provisória no Foodfy!</h2>
                    <p>abaixo sua senha provisória no sistema Foodfy - atere-a assim que possível</p>
                    <p>Senha: </p><p style="font-weight: bold">${password}</p>
                `,
            })

            return results.rows[0].id

        } catch(err) {
            console.error(err)            
        }
    },
    paginate(params){ 
        const { filter, limit, offset } = params

        let query = "",
        filterQuery = "",
            totalQuery = `(
                SELECT count(*) FROM users
            ) AS total`        

        if (filter){

            filterQuery = `
            WHERE users.name ILIKE '%${filter}%'`

            totalQuery = `(
                SELECT count(*) FROM users
                ${filterQuery}
            ) AS total`

        }        

        query = `
        SELECT users.*, ${totalQuery}
        FROM users
        ${filterQuery}
        ORDER BY updated_at DESC
        LIMIT $1 OFFSET $2`

        return db.query(query, [limit, offset])
    },
    async update(id, fields){
        let query = `UPDATE users SET`

        Object.keys(fields).map((key, index, array) => {
            if((index + 1) < array.length){
                query = `${query}
                    ${key} = '${fields[key]}',
                    `
            } else {
                query = `${query}
                    ${key} = '${fields[key]}'
                    WHERE id = ${id}
                    `
            }
        })

        await db.query(query)
        return
    },
    async delete(id) {
        // 1 - pegar todos os chefs deste usuário
        let results = await db.query(`
                SELECT * FROM chefs WHERE user_id = $1
            `, [id])        
        const chefs = results.rows

        // 2 - pegar os id's dos arquivos dos avatares de cada chef
        let chefsFilesId = []
        for( let i = 0; i < chefs.length; i++) {
            results = await Chef.findFile(chefs[i].id)
            chefsFilesId[i] = results.rows[0].file_id
        }

        // 3 - pegar todas as receitas deste usuário
        results = await db.query(`
                SELECT * FROM recipes WHERE user_id = $1
            `, [id])        
        const recipes = results.rows

        // 4 - pegar todos os id's dos arquivos das receitas
        let recipesFiles = []
        for(let i = 0; i < recipes.length; i++) {
            results = await Recipe.findRecipeFiles(recipes[i].id)
            recipesFiles[i] = results.rows
        }

        // 5 - pegar os id's dos arquivos das imagens das receitas
        let filesIds = []
        for(let i = 0; i < recipesFiles.length; i++){
            for(let j = 0; j < recipesFiles[i].length; j++){
                filesIds.push(recipesFiles[i][j].file_id)
            }
        }
        
        // 6 - deletar o usuário
        await db.query('DELETE FROM users WHERE id = $1', [id])

        // 7 - deletar os arquivos dos avatares do banco de dados e da pasta public.
        for(let i = 0; i < chefsFilesId.length; i++){
            await File.delete(chefsFilesId[i])
        }

        // 8 - deletar as imagens das receitas do banco de dados
        for(let i = 0; i < filesIds.length; i++){
            await File.delete(filesIds[i])
        }

        return


    }
}