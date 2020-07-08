module.exports = {
    date(timestamp){
        const date = new Date(timestamp)

        const year = date.getUTCFullYear()
        const month = `0${date.getUTCMonth() + 1}`.slice(-2)
        const day = `0${date.getUTCDate()}`.slice(-2)

        return {
            day,
            month,
            year,
            birthDate: `${day}/${month}`,
            iso: `${year}-${month}-${day}`,
            format: `${day}/${month}/${year}`
        }
    },
    removesEmptyPositionsFromArray(inputArray){
        let auxArray = []
        let outputArray = []

        for(let i = 0; i < inputArray.length; i++){

            auxArray[i] = inputArray[i].trim()

            if(auxArray[i] != ''){
                outputArray.push(auxArray[i])
            }
        }

        return outputArray
    }    
}