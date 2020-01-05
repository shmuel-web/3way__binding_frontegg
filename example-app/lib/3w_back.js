class User {
    dataMap = new Map()
    lastOperations = new Map() // used for fetching the newly added data

    getData(key) {
        return this.dataMap.get(key)
    }

    getVersion(key) {
        return this.lastOperations.get(key) || 0
    }

    /**
     * we use version in order to keep data integrety, 
     * to prevent an update from an unsynced client containing old data
     * @param {*} key :string
     * @param {*} value :any
     * @param {*} version is a date in an intiger form
     */
    setData(key, value, version) {
        
    
        const dataVersion = this.lastOperations.get(key) || 0
        if(version >= dataVersion){
            const newVersion = new Date().valueOf()
            this.dataMap.set(key, value)

            this.lastOperations.set(key, newVersion)
            return newVersion
        }
    }

    getNewData(lastOperationDate){
        const newData = {} 
        this.lastOperations.forEach((date, key)=>{
            debugger
            if(date > parseInt(lastOperationDate)){
                newData[key] = {
                    rawData: this.dataMap.get(key),
                    version: date
                }
            }
        })
        return newData
    }

    getAllData(){
        const data = {} 
        this.dataMap.forEach((value, key)=>{
            data[key] = {
                rawData: value,
                version: this.lastOperations.get(key)
            }
        })
        return data
    }
}

class ThreeWay {
    users = new Map()
    lastOperation = 0

    init() {
        // todo connect to a data source
    }

    set(userId, key, value, version) {
        
        const user = this.users.get(userId) || new User()
        const newVersion = user.setData(key, value, version)
        if(newVersion){
            this.lastOperation = newVersion
        }
        this.users.set(userId, user)
        return newVersion
    }

    get(userId, key) {
        const user = this.users.get(userId)
        if(user){
            return user.getData(key)
        }
    }

    getCurrentVersion(userId, key) {
        const user = this.users.get(userId)
        if(user){
            return user.getVersion(key)
        }
    }

    getNewData(userId, lastOperationDate){
        const user = this.users.get(userId)
        if(user){
            return user.getNewData(lastOperationDate)
        }   
    }

    getAllData(userId){
        
        const user = this.users.get(userId)
        if(user){
            return user.getAllData()
        }   
    }
}

module.exports = new ThreeWay()