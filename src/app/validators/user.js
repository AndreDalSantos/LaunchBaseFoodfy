const User = require('../models/User')
const { compare } = require('bcryptjs')

function checkAllFields(body){
    const keys = Object.keys(body)

    for( key of keys ) {
        if (body[key] == '') {
            return {
                user: body,
                error: 'Favor preencher todos os campos'
            }
        }
    }
}

async function post(req, res, next){
    const fillAllFields = checkAllFields(req.body)

    if(fillAllFields)
        return res.render('admin/register', fillAllFields)

    let { email }  = req.body

    const user = await User.findOne({ 
        where: { email }
    })

    if(user) return res.render('admin/register', {
        user: req.body,
        error: 'Usuário já cadastrado.'
    })

    next()
}

async function put(req, res, next){
    try {
        const { email, id } = req.body

        const fillAllFields = checkAllFields(req.body)

        if(fillAllFields)
            return res.render(`admin/user-edit`, fillAllFields)

        const user = await User.findOne({ where: {id} })

        req.user = user

        next()        

    } catch (err) {
        console.error(err)
    }
}

async function updateLoggedUser(req, res, next){
    try {
        const fillAllFields = checkAllFields(req.body)

        if(fillAllFields)
            return res.render(`admin/profile`, fillAllFields)

        const { password } = req.body
        const user = await User.findOne({ where: {id: req.session.userId } })

        const passed = await compare(password, user.password)

        if(!passed)
            return res.render('admin/profile', {
                user: req.body,
                error: 'Senha incorreta'
            })

        req.user = user

        next()        

    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    post,
    put,
    updateLoggedUser
}