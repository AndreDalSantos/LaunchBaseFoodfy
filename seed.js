const faker = require('faker')

const User = require('./src/app/models/User')
const File = require('./src/app/models/File')
const Chef = require('./src/app/models/Chef')
const { hash } = require('bcryptjs')
const RecipeFile = require('./src/app/models/RecipeFile')
const Recipe = require('./src/app/models/Recipe')

let chefsIds = []
let filesIds = []
let totalUsers = 3
let totalChefs = 10
let totalRecipes = 30

async function createUsers() {
    const users = []
    const password = await hash('111', 8)
    let admin = false

    while(users.length < totalUsers) { 
        admin = !admin
        users.push({
            name: faker.name.firstName(),
            email: faker.internet.email(),
            is_admin: admin,
            password,            
        })
    }

    const usersPromise = users.map(user => User.create(user))

    await Promise.all(usersPromise)
}

async function createChefs() {
    let chefs = []
    let files = []
    let i = 0

    while(files.length < totalChefs) {
        files.push({
            name: faker.image.image(),
            path: `public/images/chef${i+1}.png`
        })
        
        i++
    }

    const filesPromise = files.map(file => File.create(file))
    filesIds = await Promise.all(filesPromise)

    i = 0
    while(chefs.length < totalChefs) {
        chefs.push({
            file_id: filesIds[i],
            name: faker.name.firstName(),
            user_id: Math.ceil(Math.random() * totalUsers),
        })
        i++
    }

    const chefsPromise = chefs.map(chef => Chef.create(chef))
    chefsIds = await Promise.all(chefsPromise)
}

async function createRecipes(){
    let recipes = []
    let files = []
    let recipeFiles = []

    let i = 0

    while(recipes.length < totalRecipes){
        let ingredients = []
        let preparation = []
        let numberOfIngredients = Math.ceil(Math.random() * 10)
        let numberOfPreparations = Math.ceil(Math.random() * 10)

        for(let i = 0; i < numberOfIngredients; i++) {
            ingredients[i] = faker.lorem.word()
        }

        for(let i = 0; i < numberOfPreparations; i++) {
            preparation[i]= faker.lorem.word()
        }

        const chef_id = Math.ceil(Math.random() * totalChefs)

        const user_id = (await Chef.find(chef_id)).user_id
        
        recipes.push({
            user_id,
            chef_id,
            title: faker.name.title(),
            ingredients,
            preparation,
            information: faker.lorem.paragraph(Math.ceil(Math.random() * 5))
        })

        files.push({
            name: faker.image.image(),
            path: `public/images/food${i + 1}.png`
        })

        i++
    }
    
    const recipesPromise = recipes.map(file => Recipe.createRecipe(file))
    recipesIds = (await Promise.all(recipesPromise))

    recipesIds = recipesIds.map(recipeId => recipeId.rows[0].id)

    const filesPromise = files.map(file => File.create(file))
    filesIds = await Promise.all(filesPromise)

    i = 0

    while(recipeFiles.length < totalRecipes){
        recipeFiles.push({
            recipe_id: recipesIds[i],
            file_id: filesIds[i],
        })
        i++
    }

    const recipeFilesPromise = recipeFiles.map(recipeFile => RecipeFile.create(recipeFile))
    await Promise.all(recipeFilesPromise)

}

async function init(){
    await createUsers()
    await createChefs()
    await createRecipes()
}

init()
