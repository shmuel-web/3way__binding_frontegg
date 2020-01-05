(function () {

    class ThreeWay {
        userId
        serverUrl
        dataMap = new Map()
        dataVersions = new Map()
        lastSync = 0
        domNodesMap = new Map()

        init(userId, serverUrl) {
            this.userId = userId
            this.serverUrl = serverUrl
            
            // todo connect to the server and fetch data
            this.bindDom()
            this.fetchData()
            setInterval(()=>{
                this.fetchData()
            }, 300)
        }

        set(key, value) {
            // todo validate the object version
            this.dataMap.set(key, value)
            this.updateDom(key, value)
            this.syncBackend(key, value, this.dataVersions.get(key) || 0)
        }

        get(key) {
            return this.dataMap.get(key)
        }

        fetchData(){
            fetch(`${this.serverUrl}?lastSync=${this.lastSync}&userId=${this.userId}`)
            .then(res=> res.json())
            .then(res=>{
                debugger
                let domUpdateNeeded
                Object.keys(res.body).forEach(key=>{
                    domUpdateNeeded = true
                    const {rawData, version} = res.body[key]
                    this.dataMap.set(key, rawData)
                    this.updateDom(key, rawData)
                    this.dataVersions.set(key, version)
                })
            })
            .catch(err=>{
                console.log(err)
            })
        }

        syncBackend(key, value, version){
            
            const data = { key, value, version, userId: this.userId }
            fetch(`${this.serverUrl}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                  },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(res => {
                const {userId, key, value, newVersion, version: backendVersion} = res
                if (newVersion){
                    this.dataVersions.set(key, newVersion)
                }else{
                    this.dataMap.set(key, value)
                    this.dataVersions.set(key, backendVersion)
                    this.updateDom(key, value)
                    // todo optimistic UI change back a change that was not approved by the back end
                }
            })
            .catch(console.log)
        }

        bindDom() {            
            // TODO: listen on new element creation (by a framwork maybe react) using mutation observer 

            const elements = document.querySelectorAll(`[data-3w-key]`)
            elements.forEach(e => {
                const dataKey = e.getAttribute(`data-3w-key`)
                const data = this.get(dataKey)
                debugger
                const nodeLIst = this.domNodesMap.get(dataKey) || []
                nodeLIst.push(e)
                this.domNodesMap.set(dataKey, nodeLIst)
                // TODO: for input fields attach an eventListner that will try to preform a set operation
                if (e instanceof HTMLInputElement){
                    e.value = data
                    e.addEventListener('input', (event)=>{
                        const val = event.target.value
                        const key = event.target.getAttribute(`data-3w-key`)
                        this.set(key, val)
                    })
                    return
                }
                e.textContent = data
            })

        }

        updateDom(key, value) {
            debugger
            const elements = this.domNodesMap.get(key) || []
            elements.forEach(e => {
                if (e instanceof HTMLInputElement){
                    e.value = value
                    return
                }
                e.textContent = value
            })
        }
    }

    window['3w'] = new ThreeWay()

})()