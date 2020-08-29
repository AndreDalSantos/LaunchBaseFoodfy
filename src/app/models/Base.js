const db = require('../../config/db')

function find(filters, table){
    let query = `SELECT * FROM ${table}`

    if(filters){
        Object.keys(filters).map(key => {
            query += ` ${key}`
    
            Object.keys(filters[key]).map(field => {
                query += ` ${field} = '${filters[key][field]}'`
            })
        })
    }

    return db.query(query)
}

function paginate(params, table){ 
    const { filter, limit, offset } = params

    let nameOrTitle = ''
    if(table == 'recipes') nameOrTitle = 'title'
    else nameOrTitle = 'name'

    let query = "",
    filterQuery = "",
        totalQuery = `(
            SELECT count(*) FROM ${table}
        ) AS total`        

    if (filter){

        filterQuery = `
        WHERE ${table}.${nameOrTitle} ILIKE '%${filter}%'`

        totalQuery = `(
            SELECT count(*) FROM ${table}
            ${filterQuery}
        ) AS total`

    }        

    query = `
    SELECT ${table}.*, ${totalQuery}
    FROM ${table}
    ${filterQuery}
    ORDER BY updated_at DESC
    LIMIT $1 OFFSET $2`

    return db.query(query, [limit, offset])
}

const Base = {
    init({ table }){
        if(!table) throw new Error('Invalid params!')

        this.table = table

        return this
    },
    async find(id){
        try {
            const results = await find({ where: {id} }, this.table) 
               
            return results.rows[0]
            
        } catch (error) {
            console.error(error)
        }
    },
    async paginate(params){ 
        try {
            const results = await paginate(params, this.table)
            return results
        } catch (error) {
            console.error(error)
        }
    },
    async create(fields){
        try{
            let keys = [],
                values = []
            
            Object.keys(fields).map( key => {
                keys.push(key)
                values.push(`'${fields[key]}'`)
            })

            const query = `INSERT INTO ${this.table} (${keys.join(',')})
                VALUES (${values.join(',')})
                RETURNING id`

            const results = await db.query(query)
            return results.rows[0].id

        } catch(err){
            console.error(err)
        }
    },
    delete(id){
        const query = `DELETE FROM ${this.table} WHERE id = $1`
        return db.query(query, [id])
    },
    selectChefs(){
        return db.query(`
            SELECT name, user_id, id FROM chefs
        `)
    },
    async checkIfThereIsAtLeastOne(){
        const chefs = await db.query(`SELECT * FROM ${this.table}`)

        if(!chefs.rows[0]) return false
        return true
    }
}

module.exports = Base