const { date } = require('../../lib/utils')
const Chef = require('../models/Chef')
const Recipe = require('../models/Recipe')

module.exports = {
    index(req, res) {

        let { filter, page, limit } = req.query

        page = page || 1
        limit = limit || 8
        let offset = limit * (page - 1)

        const params = {
            filter,
            page,
            limit,
            offset,
            callback(chefs){
                if(chefs[0]){
                    const pagination = {
                        total: Math.ceil(chefs[0].total / limit),
                        page
                    }
                    //console.log(`total de receitas: ${chefs[0].total_recipes}`)
                    return res.render('chefs/index', { chefs, pagination, filter })
                } else {
                    return res.render('chefs/notFound')
                }
            }
        }

        Chef.paginate(params) 

    },
    create(req, res) {
        return res.render('chefs/createChef')
    },
    async show(req, res) {

        try{
            let results = await Recipe.getRecipes(req.params.id)
            const recipes = results.rows

            if(!recipes) return res.send('recipes not found')

            results = await Chef.find(req.params.id)
            const chef = results.rows[0]
            
            if(!chef) return res.send('chef not found')
            
            chef.created_at = date(chef.created_at).format

            //recipe files
            let recipe_files = []
            for(let i = 0; i < recipes.length; i++) {
                results = await Recipe.recipe_files(recipes[i].id)
                recipe_files[i] = results.rows[0]
            }

            //files
            let files = []
            for(let i = 0; i < recipe_files.length; i++) {
                results = await Recipe.files(recipe_files[i].file_id)
                files[i] = results.rows[0]
            }

            files = files.map(file => ({
                ...file,
                src: `${req.protocol}://${req.headers.host}${file.path.replace("public", "")}`
            }))

            for(let i = 0; i < recipes.length; i++) {
                recipes[i] = {
                    ...files[i],
                    ...recipes[i]
                }
            }
            
            return res.render("chefs/showChef", { chef, recipes, files })
            
        } catch (err) {
            throw new Error(err)
        }
        
    },
    post(req, res){
        const keys = Object.keys(req.body)

        for(key of keys){
            if(req.body[key] == ''){
                return res.send('Please, fill all the fields')
            }
        }
    
    
        Chef.create(req.body, function(chef){
            return res.redirect(`/chefs/${chef.id}`)
        })
    },
    async edit(req, res){
        let chef = await Chef.find(req.params.id)
        chef = chef.rows[0]

        if (!chef) return res.send('chef not found')

        chef.created_at = date(chef.created_at).format

        return res.render("chefs/edit", { chef })
        
    },
    put(req, res) {
        const keys = Object.keys(req.body)

        for (key of keys) {
            // req.body.key == ''
            if (req.body[key] == '') {
                return res.send('Please, fill all fields')
            }
        }

        Chef.update(req.body, function() {
            return res.redirect(`/chefs/${req.body.id}`)
        })
    },
    delete(req, res){
        
        Chef.delete(req.body.id, function() {
            return res.redirect(`/chefs/index`)
        })
    }
}