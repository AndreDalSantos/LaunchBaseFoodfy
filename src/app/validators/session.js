const User = require('../models/User')
const { compare } = require('bcryptjs')

async function login(req, res, next){
    const { email, password } = req.body

    const user = await User.findOne({ where: {email} })

    if(!user) return res.render('session/login', {
        user: req.body,
        error: 'Usuário não cadastrado'
    })

    const passed = await compare(password, user.password)

    if(!passed) return res.render('session/login', {
        user: req.body,
        error: "senha incorreta."
    })

    req.user = user

    next()
}

async function forgot(req, res, next){
    const { email } = req.body

    try {
        let user = await User.findOne({ where: { email } })

        if(!user) return res.render('session/forgot-password', {
            user: req.body,
            error: 'Email não cadastrado'
        })

        req.user = user

        next()

    } catch(err){
        console.error(err)
    }    
}

async function reset(req, res, next){
    // procurar o usuário
    const { email, password, token, passwordRepeat } = req.body

    const user = await User.findOne({ where: {email} })

    if(!user) return res.render('session/password-reset', {
        user: req.body,
        token,
        error: 'Usuário não cadastrado'
    })

    // ver se a senha bate
    if (password !== passwordRepeat)
        return res.render('session/password-reset', {
            user: req.body,
            token,
            error: 'senhas não conferem'
        })

    // ver se o token bate
    if(token != user.reset_token)
        return res.render('session/password-reset', {
            user: req.body,
            token,
            error: 'token inválido, solicite uma nova recuperação de senha.'
        })

    // ver se o token não expirou
    let now = new Date()
    now = now.setHours(now.getHours())

    if(now > user.reset_token_expires)
        return res.render('session/password-reset', {
            user: req.body,
            token,
            error: 'token expirado, por favor solicite uma nova recuperação de senha.'
        })

    req.user = user

    next()
}

function isReqSession(req, res, next){
    if(!req.session.userId)
        return res.redirect('/admin/login') 
    
    next()
}

async function checkIfThereAreUsers(req, res, next){
    let results = await User.checkIfYouAreTheFirstUser()

    if(!results)
        return res.redirect('/admin/users/register')

    next()
}

module.exports = {
    login,
    forgot,
    reset,
    isReqSession,
    checkIfThereAreUsers
}