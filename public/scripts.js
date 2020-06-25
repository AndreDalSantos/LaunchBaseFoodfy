const cards = document.querySelectorAll('.card')

for(let card of cards){
    card.addEventListener('click', function(){
        const recipeIndex = card.getAttribute("id")
        window.location.href = `/recipes/${recipeIndex}`
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

const PhotosUpload = {
    input: '',
    preview: document.querySelector('#photos-preview'),
    uploadLimit: 1,
    files: [],
    handleFileInput(event, limit){
        const { files: fileList } = event.target
        PhotosUpload.input = event.target
        
        PhotosUpload.uploadLimit = limit || 1

        if(PhotosUpload.hasLimit(event)) {
            PhotosUpload.updateInputFiles()
            return
        }

        Array.from(fileList).forEach(file => {

            PhotosUpload.files.push(file)

            const reader = new FileReader()

            reader.onload = () => {
                const image = new Image()
                image.src = String(reader.result)

                const div = PhotosUpload.getContainer(image)
                PhotosUpload.preview.appendChild(div)
            }

            reader.readAsDataURL(file)
        })

        PhotosUpload.updateInputFiles()
    },
    hasLimit(event){
        const { uploadLimit, input, preview } = PhotosUpload
        const { files: fileList } = input

        if(fileList.length > uploadLimit){
            alert(`Envie no máximo ${uploadLimit} fotos`)
            event.preventDefault()
            return true
        }

        const photosDiv = []
        preview.childNodes.forEach(item => {
            if (item.classList && item.classList.value == 'photo')
                photosDiv.push(item)
        })

        const totalPhotos = fileList.length + photosDiv.length
        if(totalPhotos > uploadLimit){
            alert('você atingiu o limite máximo de fotos')
            event.preventDefault()
            return true
        }

        return false
    },
    getAllFiles(){
        const dataTransfer = new ClipboardEvent('').clipboardData || new DataTransfer()

        PhotosUpload.files.forEach(file => dataTransfer.items.add(file))

        return dataTransfer.files
    },
    getContainer(image){
        const div = document.createElement('div')
        div.classList.add('photo')

        div.onclick = PhotosUpload.removePhoto

        div.appendChild(image)
        div.appendChild(PhotosUpload.getRemoveButton())

        return div
    },
    getRemoveButton(){
        const button = document.createElement('i')
        button.classList.add('material-icons')
        button.innerHTML = "close"
        return button
    },
    removePhoto(event){
        const photoDiv = event.target.parentNode // <div class="photo">
        const newFiles = Array.from(PhotosUpload.preview.children).filter(function(file){
            if(file.classList.contains('photo') && !file.getAttribute('id')) return true
        })
        
        
        const index = newFiles.indexOf(photoDiv)

        PhotosUpload.files.splice(index, 1)

        PhotosUpload.updateInputFiles()
        photoDiv.remove()
    },
    removeOldPhoto(event){
        const photoDiv = event.target.parentNode

        if(photoDiv.id){
            const removedFiles = document.querySelector('input[name="removed_files"')
            if(removedFiles){
                removedFiles.value += `${photoDiv.id},`
            }
        }

        photoDiv.remove()
    },
    updateInputFiles(){
        PhotosUpload.input.files = PhotosUpload.getAllFiles()
    }
}

const ImageGallery = {
    highlight: document.querySelector('.image-view-container .highlight > img'),
    previews: document.querySelectorAll('.gallery-preview img'),
    setImage(e){
        const { target } = e

        ImageGallery.previews.forEach(preview => preview.classList.remove('active'))
        target.classList.add('active')

        ImageGallery.highlight.src = target.src
        Lightbox.image.src = target.src
    }
}

const Lightbox = {
    target: document.querySelector('.lightbox-target'),
    image: document.querySelector('.lightbox-target img'),
    closeButton: document.querySelector('.lightbox-target a.lightbox-close'),
    open() {
        Lightbox.target.style.opacity = 1
        Lightbox.target.style.top = 0
        Lightbox.target.style.bottom = 0
        Lightbox.closeButton.style.top = 0
    },
    close() {
        Lightbox.target.style.opacity = 0
        Lightbox.target.style.top = '-100%'
        Lightbox.target.style.bottom = 'initial'
        Lightbox.closeButton.style.top = '-80px'
        console.log('olá')
    }
}