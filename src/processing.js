

function getDailyTotalTime(today) {
    getDomainsForDay(today).then(data => {
        let sum = Object.values(data).reduce(function(accumulator, currentValue) {
            return accumulator + currentValue;
        })

        console.log(sum);
        return sum;
    });
}