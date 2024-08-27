export const getYesterday = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 0);

    const day = String(yesterday.getDate()).padStart(2, '0');
    const month = String(yesterday.getMonth() + 1).padStart(2, '0'); // Mês começa do zero, então adicionamos 1
    const year = yesterday.getFullYear();

    return `${day}/${month}/${year}`;
};