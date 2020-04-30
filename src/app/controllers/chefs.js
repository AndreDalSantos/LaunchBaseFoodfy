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
    show(req, res) {

        const recipes = Recipe.getRecipes(req.params.id, function(recipes){
            if(!recipes) return res.send('recipes not found')
            
            Chef.find(req.params.id, function(chef){
                if(!chef) return res.send('chef not found')
    
                chef.created_at = date(chef.created_at).format
    
                
                console.log(chef)
                console.log(recipes)
                return res.render("chefs/showChef", { chef, recipes })
            })

            
        })

        console.log(recipes)

        
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
    edit(req, res){
        Chef.find(req.params.id, function (chef) {
            if (!chef) return res.send('chef not found')

            chef.created_at = date(chef.created_at).format

            return res.render("chefs/edit", { chef })
        })
        
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

