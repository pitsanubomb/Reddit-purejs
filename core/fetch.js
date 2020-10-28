export const getData = async (url, $option) => {

    let data, error, isLoad = false;
    await fetch(url, $option).then(async (response) => data = await response.json()).catch((e) => error = e).finally(() => isLoad == true)
    return { data, error, isLoad }
}
