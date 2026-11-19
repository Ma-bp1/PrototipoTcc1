export const inicioDoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

export const formatarData = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const aa = String(d.getFullYear()).slice(-2)
    return `${dd}/${mm}/${aa}`
}

export const formatarDataHora = (d: Date) => {
    const hh = String(d.getHours()).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    return `${formatarData(d)}, ${hh}:${min}`
}

export const dataParaArquivo = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${d.getFullYear()}${mm}${dd}`
}