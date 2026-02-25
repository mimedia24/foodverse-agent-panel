


const LocalStorageService = {


    // store data with key value
    storeData: (key, userData) => {
        if (!key) {

            console.log('[Store data] : "No key found.',);
            return null
        }

        const result = localStorage.setItem(key, JSON.stringify(userData));

        if (result) {
            return {
                success: true
            }
        } else {
            return {
                success: false
            }
        }
    },

    // get data with key value
    getData: (key) => {
        if (!key) {
            console.log('[Store data] : "No key found.',);
            return null
        }

        const result = localStorage.getItem(key);

        const parseData = JSON.parse(result)

        return parseData;
    }
}

export default LocalStorageService;