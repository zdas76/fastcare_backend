export function getDatesInRange(startStr: string, endStr: string) {
    const dateArray = [];
    let currentDate = new Date(startStr);
    const endDate = new Date(endStr);

    while (currentDate <= endDate) {
        dateArray.push(currentDate.toISOString().split('T')[0]);

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
}