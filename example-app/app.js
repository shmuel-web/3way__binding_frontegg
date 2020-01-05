const threeWay = require('./lib/3w_back')
var express = require('express')
const bodyParser = require('body-parser');

var app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());
const PORT = 3000

app.get('/hello', function (req, res) {
  res.send('hello world')
})

app.get('/3w', function (req, res) {
  
  const {lastSync, userId} = req.query
  if(!userId){
    res.send('no userId')
    return // exit
  }
  if(lastSync == 0 ){
    const data = threeWay.getAllData(userId)
    res.json({body: data, lastSync: threeWay.lastOperation})
    return
  }
  res.json({body: threeWay.getNewData(userId, lastSync)})
})

app.post('/3w', function (req, res){
  
  const {key, value, version, userId} = req.body
  const newVersion = threeWay.set(userId, key, value, version)
  if(newVersion){
    res.json({userId, key, value, newVersion})
    return
  }
  const currentVal = threeWay.get(userId, key)
  const currentVersion = threeWay.getCurrentVersion(userId, key)
  
  res.json({
    userId, 
    key, 
    value: currentVal,
    version: currentVersion
  })
})

var options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ['htm', 'html'],
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
      res.set('x-timestamp', Date.now())
    }
  }
  
app.use(express.static('public', options))

app.listen(PORT, err => {
  if(err){
    console.log(err)
    return
  }
  console.log(`
    app is listening on port ${PORT}
    please open the link below to test...


    http://localhost:3000/3apps.html

  `)
})
