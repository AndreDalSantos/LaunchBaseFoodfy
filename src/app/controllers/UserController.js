const User = require('../models/User')
const { indexPaginate } = require('../../lib/utils2')

module.exports = {
    registerForm(req, res) {
        return res.render('admin/register')
    },
    async list(req, res){
        try {

            const { users, filter, page, limit, offset } = await indexPaginate(req, res)

    
            if(users[0]){
    
                const pagination = {
                    total: Math.ceil(users[0].total / limit),
                    page
                }                
    
                return res.render('admin/list', { users, pagination, filter, userId: req.session.userId })
    
            } else {
                return res.render('admin/list')
            } 

        } catch(err){
            console.error(err)
            return res.render('admin/list', {
                error: 'Algum erro inseperado aconteceu.'
            })
        }
    },
    async post(req, res){
        
        try{
            let results = await User.checkIfYouAreTheFirstUser()

            const userId = await User.create(req.body)

            if ( !results )
                req.session.userId = userId

            return res.redirect('/admin/users')

        } catch (err) {
            console.error(err)
            return res.render('admin/register', {
                error: 'Erro inesperado, tente novamente.'
            })
        }
    },
    async show(req, res){
        try {
            let { id } = req.params
            
            const user = await User.findOne({ 
                where: { id }
            })

            if(!user)
                return res.render('admin/user-edit', {
                    error: 'Usuário inexistente'
                })
            
            return res.render('admin/user-edit', { user, id })
        } catch (err) {
            console.error(err)
            return res.render('admin/user-edit', {
                error: 'Algum erro inseperado aconteceu.'
            })
        }
    },
    async put(req, res){
        try {

            const { userId } = req.session
            
            let { name, email, is_admin, id } = req.body

            let isAdmin = is_admin ? true : false

            await User.update(id, {
                name,
                email,
                is_admin: isAdmin
            })

            const { users, filter, page, limit, offset } = await indexPaginate(req, res)

    
            if(users[0]){
    
                const pagination = {
                    total: Math.ceil(users[0].total / limit),
                    page
                }                
    
                return res.render('admin/list', { 
                    users, 
                    pagination, 
                    filter, 
                    userId: req.session.userId,
                    success: 'Conta atualizada com sucesso'
                })
    
            } else {
                return res.render('admin/list')
            } 

        } catch (err) {
            console.error(err) 
        }
    },
    async delete(req, res){
        
        try {

            await User.delete(req.body.id)

            const { users, filter, page, limit, offset } = await indexPaginate(req, res)

            if(users[0]){

                const pagination = {
                    total: Math.ceil(users[0].total / limit),
                    page
                }      

                return res.render('admin/list', { 
                    users, 
                    pagination, 
                    filter, 
                    userId: req.session.userId, 
                    success: 'Conta deletada com sucesso'
                })

            } else {
                return res.render('admin/list')
            }


        } catch (err) {
            console.error(err)
            return res.render('admin/list', {
                user: req.body,
                error: "Erro ao tentar deletar esta conta."
            })
        }
    }
}