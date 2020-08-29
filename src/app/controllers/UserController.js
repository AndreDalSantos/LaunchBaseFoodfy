const { hash } = require('bcryptjs')
const crypto = require('crypto')
const mailer = require('../../lib/mailer')

const { indexPaginate } = require('../services/services')

const User = require('../models/User')


module.exports = {
    registerForm(req, res) {
        return res.render('admin/register')
    },
    async list(req, res){
        try {

            const { users, pagination, filter } = await indexPaginate(req.query, 12)
    
            if(users)
                return res.render('admin/list', { users, pagination, filter, userId: req.session.userId })
            else
                return res.render('admin/error', { userId: req.session.userId, message: "Página ou parâmetros inválidos." })

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

            
            let password = crypto.randomBytes(20).toString('hex')
            const passwordHashed = await hash(password, 8)
            
            let isAdmin = req.body.is_admin ? true : false
            
            if( !results )              
                isAdmin = true 
            
            const newUser = {
                ...req.body,
                password: passwordHashed,
                is_admin: isAdmin
            }

            const userId = await User.create(newUser)

            await mailer.sendMail({
                to: newUser.email,
                from: 'no-reply@foodfy.com.br',
                subject: 'Sua senha provisória no Foodfy!',
                html: `                
                    <h2>Sua senha provisória no Foodfy!</h2>
                    <p>abaixo sua senha provisória no sistema Foodfy - atere-a assim que possível</p>
                    <p>Senha: </p><p style="font-weight: bold">${password}</p>
                `,
            })

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
                return res.render('admin/error', {
                    error: "Usuário inexistente!"
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

            const { users, pagination, filter } = await indexPaginate(req.query, 12)
    
            if(users)
                return res.render('admin/list', { 
                    users, 
                    pagination, 
                    filter, 
                    userId: req.session.userId,
                    success: 'Conta atualizada com sucesso' 
                })
            else
                return res.render('admin/error', { userId: req.session.userId })   

        } catch (err) {
            console.error(err) 
        }
    },
    async delete(req, res){
        
        try {

            await User.delete(req.body.id)

            const { users, filter, pagination } = await indexPaginate(req.query, 12)

            if(users[0])
                return res.render('admin/list', { 
                    users, 
                    pagination, 
                    filter, 
                    userId: req.session.userId, 
                    success: 'Conta deletada com sucesso'
                })
            else
                return res.render('admin/error', {
                    error: "Usuário inexistente!"
                })            

        } catch (err) {
            console.error(err)
            return res.render('admin/list', {
                user: req.body,
                error: "Erro ao tentar deletar esta conta."
            })
        }
    }
}