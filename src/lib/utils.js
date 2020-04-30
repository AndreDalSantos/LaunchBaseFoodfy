module.exports = {
    age(timestamp){
        const today = new Date()
        const birthDate = new Date(timestamp)
    
        // retorna 2019 - 1984 = 35
        let age = today.getFullYear() - birthDate.getFullYear()
    
        const month = today.getMonth() - birthDate.getMonth()
          
    
        if(month < 0 || month == 0 && today.getDate() < birthDate.getDate()) {
            age = age - 1
        }
    
        return age
    },
    date(timestamp) {
        const date = new Date(timestamp)

        const year = date.getUTCFullYear()
        const month = `0${date.getUTCMonth() + 1}`.slice(-2)       //a função getMonth retorna de 0 a 11
        const day = `0${date.getUTCDate()}`.slice(-2)               //o slice(-2) considera apenas os 2 ultimos dígitos (de 012, retorna 12, por exemplo)

        //return `${year}-${month}-${day}`
        return {
            day,
            month,
            year,
            iso: `${year}-${month}-${day}`,
            birthDay: `${day}/${month}`,
            format: `${day}/${month}/${year}`
        }
    },
    checkBlood(blood){
        if (blood.slice(-1) == '0')
            return blood.replace('0', '-')
        return blood.replace('1', '+')
    }
}

