const User = require('../app/models/User')
const Recipe = require('../app/models/Recipe')

module.exports = {
    async indexPaginate(req, res){
        let { filter, page, limit } = req.query
    
            page = page || 1
            limit = limit || 12
            let offset = limit * (page - 1)
    
            const params = {
                filter,
                page,
                limit,
                offset
            }
    
            let results = await User.paginate(params)
            const users = results.rows
    
            return { users, filter, page, limit, offset }
    }
}