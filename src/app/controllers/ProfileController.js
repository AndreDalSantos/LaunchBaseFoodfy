const User = require('../models/User')

module.exports = {
    async index(req, res){
        try { 
            
            const user = await User.findOne({ 
                where: { id: req.session.userId }
            })

            if(!user){
                return res.render('admin/user-edit', {
                    error: 'Usuário inexistente'
                })
            }
            
            return res.render('admin/profile', { user })
        } catch (err) {
            console.log(err)
            return res.render('admin/profile', {
                error: 'Algum erro inseperado aconteceu.'
            })
        }
    },
    async put(req, res){
        try{
            const { user } = req

            let { name, email } = req.body

            await User.update(user.id, {
                name,
                email
            })

            return res.render('admin/success', {
                route: '/admin/users',
                success: 'Conta atualizada com sucesso.'
            })

        } catch(err){
            console.error(err)
            return res.render('admin/profile', {
                error: 'Algum erro inesperado ocorreu.'
            })
        }
    }
}