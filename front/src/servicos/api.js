import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/'
});

export const get = async (rota) => {
    try {
        const resposta = await api.get(rota);
        return resposta.data;
    } catch (erro) {
        throw erro;
    }
};

export const post = async (rota, objeto) => {
    try {
        const resposta = await api.post(rota, objeto);
        return resposta.data;
    } catch (erro) {
        throw erro;
    }
};

export const patch = async (rota, objeto) => {
    try {
        const resposta = await api.patch(rota, objeto);
        return resposta.data;
    } catch (erro) {
        throw erro;
    }
};
