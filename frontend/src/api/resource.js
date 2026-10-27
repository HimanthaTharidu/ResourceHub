const API_URL = import.meta.env.VITE_API_URL;


async function request(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`,{
        ...options,
        credentials: "include",
        headers: {
            ...(options.body && { "content-type": "application/json"}),
            ...options.headers,
        }
    })
    
    const data = await response.json().catch(() =>({}));
    if(!response.ok){
        throw new Error(data.message || "Request failed")
    }

    return data;
}

export function getResources(){
    return request('/resources');
}

export function createResource(resourceData){
    return request('/resources', {
        method: 'POST',
        body: JSON.stringify(resourceData)
    });
}