import React from 'react'

const backendUrl = (urlType: string) => {

    const quizUrl = "http://localhost:8083"
    const authUrl = "http://localhost:8082"
    
    if( urlType === "quiz" ) {
        return quizUrl
    }
    if( urlType === "auth" ) {
        return authUrl
    }
}

export default backendUrl
