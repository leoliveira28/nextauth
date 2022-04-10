import { useContext, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { api } from "../services/apiClient"
import { setupApiClient } from '../services/api'
import { withSSRAuth } from "../utils/withSSRAuth"
import { AuthTokenError } from "../services/AuthTokenError"
import { destroyCookie } from "nookies"

export default function Dashboard(){
    const { user } = useContext(AuthContext)

   useEffect(() => {
       api.get('/me')
       .then(response => console.log(response))
       .catch(err => console.error(err))
   }, [])
    return (
                <h1>Dashboard: {user?.email}</h1>
    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiClient = setupApiClient(ctx);
    
        const response = await apiClient.get('/me')
   
    return {
        props: {}
    }
})