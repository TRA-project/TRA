const Mock = require('mockjs')

let id = Mock.mock('@id')

let obj = Mock.mock({
    id:'@id'
})
console.log(id)
console.log(obj)


