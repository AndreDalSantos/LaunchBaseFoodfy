const cards = document.querySelectorAll('.card')

for(let card of cards){
    card.addEventListener('click', function(){
        const recipeIndex = card.getAttribute("id")
        window.location.href = `/receitas/${recipeIndex}`
    })
}

const show_hide_info = document.querySelectorAll('.sub-title_1')
const ingredientsBlock = document.querySelector('.ingredients-block')
const prepareBlock = document.querySelector('.prepare-block')
const informationBlock = document.querySelector('.information-block')
const esconder = 'Esconder'
const mostrar = 'Mostrar'

for(let item of show_hide_info){
    item.addEventListener('click', function(){
        const id = item.getAttribute("id")
        
        if( id === 'ingredientId'){
            if(ingredientsBlock.classList.contains('active')){                
                ingredientsBlock.classList.remove('active')
                document.querySelector('#ingredientId').innerHTML = mostrar
            } else {
                ingredientsBlock.classList.add('active')
                document.querySelector('#ingredientId').innerHTML = esconder
            }   
        }
        else if ( id === 'prepareId'){
            if(prepareBlock.classList.contains('active')){
                prepareBlock.classList.remove('active')
                document.querySelector('#prepareId').innerHTML = mostrar
            } else {
                prepareBlock.classList.add('active')
                document.querySelector('#prepareId').innerHTML = esconder
            } 

        }
        else if ( id === 'infoId'){
            if(informationBlock.classList.contains('active')){
                informationBlock.classList.remove('active')
                document.querySelector('#infoId').innerHTML = mostrar
            } else {
                informationBlock.classList.add('active')
                document.querySelector('#infoId').innerHTML = esconder
            } 
        }
    })
}