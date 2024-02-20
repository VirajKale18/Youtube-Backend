// defines a custom error class (ApiError) extended from the inbuilt Error class with properties specific to API error handling and exports it for use in other parts of the application. This is a common pattern in web development when we need to provide more context and information about errors that occur in the context of an API.

   class ApiError extends Error{
        constructor(statusCode,message="something went wrong",errors=[],stack=""){
            super(message)
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors

        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

        }

    }

    export {ApiError}   