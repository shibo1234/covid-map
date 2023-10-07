import axios from "axios"

export const CovidCaseService = {
    getAllCountyCases :() => {
        return axios.get("http://44.217.206.125:8080/covid/county")
    }
}