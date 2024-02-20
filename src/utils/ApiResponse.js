// defines a class (ApiResponse) for creating consistent response objects in the context of API responses. It includes properties such as statusCode, data, message, and success to represent the key components of an API response. This can help maintain a standardized structure for responses throughout an application.

class ApiResponse {
    constructor(statusCode,data,message="Success"){
        this.statusCode = statusCode;
        this.data = data
        this.message= message;
        this.success = statusCode < 400;
        
    }    
}

export {ApiResponse}