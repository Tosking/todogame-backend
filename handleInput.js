var sanitizer = require('sanitizer');

function signupHandler(req) {
    if(!req.body.login || !req.body.password || !req.body.email){
        return false
    }
    let login = sanitizer.sanitize(req.body.login.trim().replace(/[^\x00-\x7F]/g, ""))
    let email = sanitizer.sanitize(req.body.email.trim().replace(/[^\x00-\x7F]/g, ""))
    let password = sanitizer.sanitize(req.body.password.trim().replace(/[^\x00-\x7F]/g, ""))
    if(!login || password.length < 8 ||
        !email.match("^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*$")){
        return false
    }
    return {login: login, password: password, email: email}
}

function signinHandler(){
    if(!req.body.login  || !req.body.password){
        return false
    }
    let login = sanitizer.sanitize(req.body.login)
    let password = sanitizer.sanitize(req.body.password)
    if(!login || password.length < 8){
        return false
    }
    return true
}

module.exports = {
    signupHandler,
    signinHandler
}