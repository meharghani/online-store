class ApiError extends Error{
    constructor(statsCode, message="Something went wronge",errors = [], stack = ""){
        super(message)
        this.statsCode = statsCode,
        this.message = message
        this.errors = errors
        this.data = null

        if(this.stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
        

    }
}

export{
    ApiError
}